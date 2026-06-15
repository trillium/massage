import { add, areIntervalsOverlapping, sub } from 'date-fns'
import type { DateTimeInterval } from '@/lib/types'
import type { GoogleCalendarV3Event } from '@/lib/calendarTypes'
import {
  filterEventsForQuery,
  filterEventsForGeneralBlocking,
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
  blockingScope?: 'event' | 'general'
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
  blockingScope?: 'event' | 'general'
  sessionId?: string
}

export type CheckSlotAvailabilityFn = (params: SlotCheckParams) => Promise<{ available: boolean }>

export async function checkSlotAvailability(
  params: CheckSlotAvailabilityParams
): Promise<{ available: boolean }> {
  try {
    const slotInterval = { start: new Date(params.start), end: new Date(params.end) }

    const blocked = params.eventBaseString
      ? await isBlockedByEventSearch(slotInterval, params)
      : await isBlockedByBusyTimes(slotInterval, params)

    if (blocked) return { available: false }

    if (params.getActiveHoldsFn) {
      const activeHolds = await params.getActiveHoldsFn(params.start, params.end, params.sessionId)
      if (hasOverlap(slotInterval, activeHolds, 0)) {
        console.log('[checkSlotAvailability] blocked by active hold', {
          activeHolds,
          sessionId: params.sessionId,
        })
        return { available: false }
      }
    }

    return { available: true }
  } catch (error) {
    console.error('Availability check failed, rejecting booking (fail-closed):', error)
    return { available: false }
  }
}

async function isBlockedByEventSearch(
  slotInterval: { start: Date; end: Date },
  params: CheckSlotAvailabilityParams
): Promise<boolean> {
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
    return true
  }

  if (params.blockingScope === 'general') {
    const { blockingEvents } = filterEventsForGeneralBlocking(allEvents)
    if (hasOverlap(slotInterval, memberEventsToIntervals(blockingEvents ?? []), params.padding)) {
      console.log('[checkSlotAvailability] blocked by general blocking event', {
        blockingEvents: (blockingEvents ?? []).map((e) => e.summary),
      })
      return true
    }
  }

  return false
}

async function isBlockedByBusyTimes(
  slotInterval: { start: Date; end: Date },
  params: CheckSlotAvailabilityParams
): Promise<boolean> {
  const busyTimes = await params.getBusyTimesFn(slotInterval)
  if (hasOverlap(slotInterval, busyTimes, params.padding)) {
    console.log('[checkSlotAvailability] blocked by busy time (no eventBaseString)', { busyTimes })
    return true
  }
  return false
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
