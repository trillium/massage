import { add, areIntervalsOverlapping, sub } from 'date-fns'
import type { DateTimeInterval } from '@/lib/types'
import type { GoogleCalendarV3Event } from '@/lib/calendarTypes'
import {
  filterEventsForQuery,
  filterEventsForGeneralBlocking,
  filterEventsForContainerSet,
} from '@/lib/fetch/fetchContainersByQuery'

type GetActiveHoldsFn = (
  start: string,
  end: string,
  excludeSessionId?: string
) => Promise<DateTimeInterval[]>

type CheckSlotAvailabilityParams = {
  start: string
  end: string
  padding: number
  eventBaseString?: string
  blockingScope?: 'event' | 'general' | 'containers'
  blockingContainers?: string[]
  sessionId?: string
  getBusyTimesFn: (args: DateTimeInterval) => Promise<DateTimeInterval[]>
  getEventsBySearchQueryFn: (args: {
    query: string
    start?: string | Date
    end?: string | Date
  }) => Promise<GoogleCalendarV3Event[]>
  getActiveHoldsFn?: GetActiveHoldsFn
}

export type SlotCheckParams = {
  start: string
  end: string
  eventBaseString?: string
  blockingScope?: 'event' | 'general' | 'containers'
  blockingContainers?: string[]
  sessionId?: string
}

export type CheckSlotAvailabilityResult = {
  available: boolean
  reason?: string
  detail?: Record<string, unknown>
}

export type CheckSlotAvailabilityFn = (
  params: SlotCheckParams
) => Promise<CheckSlotAvailabilityResult>

export async function checkSlotAvailability(
  params: CheckSlotAvailabilityParams
): Promise<CheckSlotAvailabilityResult> {
  try {
    const slotInterval = { start: new Date(params.start), end: new Date(params.end) }

    const blockReason = params.eventBaseString
      ? await isBlockedByEventSearch(slotInterval, params)
      : await isBlockedByBusyTimes(slotInterval, params)

    if (blockReason)
      return { available: false, reason: blockReason.reason, detail: blockReason.detail }

    if (params.getActiveHoldsFn) {
      const activeHolds = await params.getActiveHoldsFn(params.start, params.end, params.sessionId)
      if (hasOverlap(slotInterval, activeHolds, 0)) {
        console.log('[checkSlotAvailability] blocked by active hold', {
          activeHolds,
          sessionId: params.sessionId,
        })
        return {
          available: false,
          reason: 'active_hold',
          detail: { activeHolds, sessionId: params.sessionId },
        }
      }
    }

    return { available: true }
  } catch (error) {
    console.error('Availability check failed, rejecting booking (fail-closed):', error)
    return {
      available: false,
      reason: 'exception',
      detail: { message: error instanceof Error ? error.message : String(error) },
    }
  }
}

type BlockReason = { reason: string; detail: Record<string, unknown> }

async function isBlockedByEventSearch(
  slotInterval: { start: Date; end: Date },
  params: CheckSlotAvailabilityParams
): Promise<BlockReason | null> {
  const allEvents = await params.getEventsBySearchQueryFn({
    query: '',
    start: params.start,
    end: params.end,
  })

  const { members: memberEvents } = filterEventsForQuery(allEvents, params.eventBaseString!)
  if (hasOverlap(slotInterval, memberEventsToIntervals(memberEvents), params.padding)) {
    console.log('[checkSlotAvailability] blocked by member event overlap', {
      eventBaseString: params.eventBaseString,
      memberEvents: memberEvents.map((e) => e.summary),
    })
    return {
      reason: 'member_event_overlap',
      detail: {
        eventBaseString: params.eventBaseString,
        summaries: memberEvents.map((e) => e.summary),
      },
    }
  }

  if (params.blockingScope === 'general') {
    const { blockingEvents } = filterEventsForGeneralBlocking(allEvents)
    if (hasOverlap(slotInterval, memberEventsToIntervals(blockingEvents ?? []), params.padding)) {
      console.log('[checkSlotAvailability] blocked by general blocking event', {
        blockingEvents: (blockingEvents ?? []).map((e) => e.summary),
      })
      return {
        reason: 'general_blocking_event',
        detail: { summaries: (blockingEvents ?? []).map((e) => e.summary) },
      }
    }
  }

  if (params.blockingScope === 'containers') {
    const { blockingEvents } = filterEventsForContainerSet(
      allEvents,
      params.blockingContainers ?? []
    )
    if (hasOverlap(slotInterval, memberEventsToIntervals(blockingEvents), params.padding)) {
      console.log('[checkSlotAvailability] blocked by container-set member event', {
        blockingContainers: params.blockingContainers,
        blockingEvents: blockingEvents.map((e) => e.summary),
      })
      return {
        reason: 'container_set_overlap',
        detail: {
          blockingContainers: params.blockingContainers,
          summaries: blockingEvents.map((e) => e.summary),
        },
      }
    }
  }

  return null
}

async function isBlockedByBusyTimes(
  slotInterval: { start: Date; end: Date },
  params: CheckSlotAvailabilityParams
): Promise<BlockReason | null> {
  const busyTimes = await params.getBusyTimesFn(slotInterval)
  if (hasOverlap(slotInterval, busyTimes, params.padding)) {
    console.log('[checkSlotAvailability] blocked by busy time (no eventBaseString)', { busyTimes })
    return { reason: 'busy_time_overlap', detail: { busyTimes } }
  }
  return null
}

export function createCheckSlotAvailability({
  padding,
  getBusyTimesFn,
  getEventsBySearchQueryFn,
  getActiveHoldsFn,
}: {
  padding: number
  getBusyTimesFn: CheckSlotAvailabilityParams['getBusyTimesFn']
  getEventsBySearchQueryFn: CheckSlotAvailabilityParams['getEventsBySearchQueryFn']
  getActiveHoldsFn?: GetActiveHoldsFn
}): CheckSlotAvailabilityFn {
  return (params) =>
    checkSlotAvailability({
      ...params,
      padding,
      getBusyTimesFn,
      getEventsBySearchQueryFn,
      getActiveHoldsFn,
    })
}

function hasOverlap(
  slot: { start: Date; end: Date },
  busySlots: DateTimeInterval[],
  padding: number
): boolean {
  return busySlots.some((busy) => {
    const busyStart = sub(busy.start, { minutes: padding })
    const busyEnd = add(busy.end, { minutes: padding })
    return areIntervalsOverlapping(slot, { start: busyStart, end: busyEnd })
  })
}

function memberEventsToIntervals(events: GoogleCalendarV3Event[]): DateTimeInterval[] {
  return events.map((event) => ({
    start: new Date(event.start.dateTime ?? event.start.date ?? ''),
    end: new Date(event.end.dateTime ?? event.end.date ?? ''),
  }))
}
