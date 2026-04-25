import type { GoogleCalendarV3Event } from '@/lib/calendarTypes'
import type { DateTimeInterval } from '@/lib/types'
import { areIntervalsOverlapping } from 'date-fns'

let eventCounter = 0

export function calendarEvent(
  summary: string,
  start: string,
  end: string,
  description?: string
): GoogleCalendarV3Event {
  return {
    id: `mock-evt-${++eventCounter}`,
    summary,
    description,
    start: { dateTime: start },
    end: { dateTime: end },
    kind: 'calendar#event',
    etag: `"etag-${eventCounter}"`,
    status: 'confirmed',
    htmlLink: `https://calendar.google.com/event?eid=mock-evt-${eventCounter}`,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    iCalUID: `mock-${eventCounter}@google.com`,
    sequence: 0,
    reminders: { useDefault: true },
  }
}

export function containerEvent(query: string, start: string, end: string) {
  return calendarEvent(`${query}__EVENT__CONTAINER__`, start, end, `${query}__EVENT__CONTAINER__`)
}

export function memberEvent(query: string, start: string, end: string, clientName = 'Test Client') {
  return calendarEvent(
    `30 minute massage with ${clientName} - TrilliumMassage`,
    start,
    end,
    `${query}__EVENT__MEMBER__`
  )
}

export function regularEvent(summary: string, start: string, end: string) {
  return calendarEvent(summary, start, end)
}

export class MockCalendar {
  private events: GoogleCalendarV3Event[] = []

  add(...newEvents: GoogleCalendarV3Event[]) {
    this.events.push(...newEvents)
    return this
  }

  addContainer(query: string, start: string, end: string) {
    this.events.push(containerEvent(query, start, end))
    return this
  }

  addMember(query: string, start: string, end: string, clientName?: string) {
    this.events.push(memberEvent(query, start, end, clientName))
    return this
  }

  addRegular(summary: string, start: string, end: string) {
    this.events.push(regularEvent(summary, start, end))
    return this
  }

  search(query: string, start?: string | Date, end?: string | Date): GoogleCalendarV3Event[] {
    let results = this.events

    if (query) {
      results = results.filter((e) => e.summary.includes(query) || e.description?.includes(query))
    }

    if (start || end) {
      const rangeStart = start ? new Date(start) : new Date(0)
      const rangeEnd = end ? new Date(end) : new Date('2099-12-31')

      results = results.filter((e) => {
        const eventStart = new Date(e.start.dateTime ?? e.start.date ?? '')
        const eventEnd = new Date(e.end.dateTime ?? e.end.date ?? '')
        return areIntervalsOverlapping(
          { start: eventStart, end: eventEnd },
          { start: rangeStart, end: rangeEnd }
        )
      })
    }

    return results
  }

  getBusyTimes(interval: DateTimeInterval): DateTimeInterval[] {
    return this.search('', interval.start, interval.end).map((e) => ({
      start: new Date(e.start.dateTime ?? e.start.date ?? ''),
      end: new Date(e.end.dateTime ?? e.end.date ?? ''),
    }))
  }

  toGetEventsBySearchQueryFn() {
    return async (args: { query: string; start?: string | Date; end?: string | Date }) =>
      this.search(args.query)
  }

  toGetBusyTimesFn() {
    return async (interval: DateTimeInterval) => this.getBusyTimes(interval)
  }

  clear() {
    this.events = []
    return this
  }

  get all() {
    return [...this.events]
  }

  get count() {
    return this.events.length
  }
}

export function resetEventCounter() {
  eventCounter = 0
}
