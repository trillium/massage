import { add, areIntervalsOverlapping, sub } from 'date-fns'
import type { DateTimeInterval } from '@/lib/types'
import type { GoogleCalendarV3Event } from '@/lib/calendarTypes'
import {
  filterEventsForQuery,
  filterEventsForGeneralBlocking,
} from '@/lib/fetch/fetchContainersByQuery'

type CheckSlotAvailabilityParams = {
  start: string
  end: string
  padding: number
  eventBaseString?: string
  blockingScope?: 'event' | 'general'
  getBusyTimesFn: (args: DateTimeInterval) => Promise<DateTimeInterval[]>
  getEventsBySearchQueryFn: (args: {
    query: string
    start?: string | Date
    end?: string | Date
  }) => Promise<GoogleCalendarV3Event[]>
}

export type SlotCheckParams = {
  start: string
  end: string
  eventBaseString?: string
  blockingScope?: 'event' | 'general'
}

export type CheckSlotAvailabilityFn = (params: SlotCheckParams) => Promise<{ available: boolean }>

export async function checkSlotAvailability({
  start,
  end,
  padding,
  eventBaseString,
  blockingScope,
  getBusyTimesFn,
  getEventsBySearchQueryFn,
}: CheckSlotAvailabilityParams): Promise<{ available: boolean }> {
  try {
    const slotInterval = { start: new Date(start), end: new Date(end) }

    if (eventBaseString) {
      const allEvents = await getEventsBySearchQueryFn({
        query: '',
        start,
        end,
      })

      const { members: memberEvents } = filterEventsForQuery(allEvents, eventBaseString)

      if (hasOverlap(slotInterval, memberEventsToIntervals(memberEvents), padding)) {
        return { available: false }
      }

      if (blockingScope === 'general') {
        const { blockingEvents } = filterEventsForGeneralBlocking(allEvents)
        if (hasOverlap(slotInterval, memberEventsToIntervals(blockingEvents ?? []), padding)) {
          return { available: false }
        }
      }

      return { available: true }
    }

    const busyTimes = await getBusyTimesFn(slotInterval)
    if (hasOverlap(slotInterval, busyTimes, padding)) {
      return { available: false }
    }

    return { available: true }
  } catch (error) {
    console.error('Availability check failed, rejecting booking (fail-closed):', error)
    return { available: false }
  }
}

export function createCheckSlotAvailability({
  padding,
  getBusyTimesFn,
  getEventsBySearchQueryFn,
}: {
  padding: number
  getBusyTimesFn: CheckSlotAvailabilityParams['getBusyTimesFn']
  getEventsBySearchQueryFn: CheckSlotAvailabilityParams['getEventsBySearchQueryFn']
}): CheckSlotAvailabilityFn {
  return (params) =>
    checkSlotAvailability({
      ...params,
      padding,
      getBusyTimesFn,
      getEventsBySearchQueryFn,
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
