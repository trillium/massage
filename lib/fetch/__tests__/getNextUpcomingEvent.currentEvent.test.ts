import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getNextUpcomingEvent } from '@/lib/fetch/getNextUpcomingEvent'
import type { GoogleCalendarV3Event } from '@/lib/types'
import { subHours, addHours, subMinutes, addMinutes } from 'date-fns'

vi.mock('@/lib/fetch/fetchContainersByQuery')

describe('getNextUpcomingEvent - Current Event Detection', () => {
  let mockFetchAllCalendarEvents: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()

    const fetchModule = await import('@/lib/fetch/fetchContainersByQuery')
    mockFetchAllCalendarEvents = vi.mocked(fetchModule.fetchAllCalendarEvents)
  })

  it('should return current event when an event is in progress NOW', async () => {
    const now = new Date()
    const eventStartedOneHourAgo = subHours(now, 1)
    const eventEndsInOneHour = addHours(now, 1)

    const currentEvent: GoogleCalendarV3Event = {
      kind: 'calendar#event',
      etag: 'etag-current',
      id: 'current-event-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=current',
      created: subHours(now, 24).toISOString(),
      updated: subHours(now, 24).toISOString(),
      summary: 'Current Massage Session__EVENT__',
      description: 'In progress now',
      location: '123 Main St, Los Angeles, CA',
      start: { dateTime: eventStartedOneHourAgo.toISOString() },
      end: { dateTime: eventEndsInOneHour.toISOString() },
      iCalUID: 'current-event@google.com',
      sequence: 0,
      reminders: {},
    }

    mockFetchAllCalendarEvents.mockResolvedValue({
      start: now.toISOString().split('T')[0],
      end: addHours(now, 18).toISOString().split('T')[0],
      allEvents: [currentEvent],
    })

    const result = await getNextUpcomingEvent()

    expect(result).not.toBeNull()
    expect(result?.id).toBe('current-event-id')
    expect(result?.summary).toContain('Current Massage Session')
  })

  it('should return current event when it just started (1 minute ago)', async () => {
    const now = new Date()
    const justStarted = subMinutes(now, 1)
    const endsInFuture = addHours(now, 1)

    const currentEvent: GoogleCalendarV3Event = {
      kind: 'calendar#event',
      etag: 'etag-just-started',
      id: 'just-started-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=just-started',
      created: subHours(now, 24).toISOString(),
      updated: subHours(now, 24).toISOString(),
      summary: 'Just Started Session__EVENT__',
      start: { dateTime: justStarted.toISOString() },
      end: { dateTime: endsInFuture.toISOString() },
      iCalUID: 'just-started@google.com',
      sequence: 0,
      reminders: {},
    }

    mockFetchAllCalendarEvents.mockResolvedValue({
      start: now.toISOString().split('T')[0],
      end: addHours(now, 18).toISOString().split('T')[0],
      allEvents: [currentEvent],
    })

    const result = await getNextUpcomingEvent()

    expect(result).not.toBeNull()
    expect(result?.id).toBe('just-started-id')
  })

  it('should return current event when it ends in 1 minute', async () => {
    const now = new Date()
    const started = subHours(now, 1)
    const endsInOneMinute = addMinutes(now, 1)

    const currentEvent: GoogleCalendarV3Event = {
      kind: 'calendar#event',
      etag: 'etag-almost-done',
      id: 'almost-done-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=almost-done',
      created: subHours(now, 24).toISOString(),
      updated: subHours(now, 24).toISOString(),
      summary: 'Almost Done Session__EVENT__',
      start: { dateTime: started.toISOString() },
      end: { dateTime: endsInOneMinute.toISOString() },
      iCalUID: 'almost-done@google.com',
      sequence: 0,
      reminders: {},
    }

    mockFetchAllCalendarEvents.mockResolvedValue({
      start: now.toISOString().split('T')[0],
      end: addHours(now, 18).toISOString().split('T')[0],
      allEvents: [currentEvent],
    })

    const result = await getNextUpcomingEvent()

    expect(result).not.toBeNull()
    expect(result?.id).toBe('almost-done-id')
  })

  it('should prefer current event over future events', async () => {
    const now = new Date()

    const currentEvent: GoogleCalendarV3Event = {
      kind: 'calendar#event',
      etag: 'etag-current',
      id: 'current-event-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=current',
      created: subHours(now, 24).toISOString(),
      updated: subHours(now, 24).toISOString(),
      summary: 'Current Session__EVENT__',
      start: { dateTime: subMinutes(now, 30).toISOString() },
      end: { dateTime: addMinutes(now, 30).toISOString() },
      iCalUID: 'current@google.com',
      sequence: 0,
      reminders: {},
    }

    const futureEvent: GoogleCalendarV3Event = {
      kind: 'calendar#event',
      etag: 'etag-future',
      id: 'future-event-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=future',
      created: subHours(now, 24).toISOString(),
      updated: subHours(now, 24).toISOString(),
      summary: 'Future Session__EVENT__',
      start: { dateTime: addHours(now, 2).toISOString() },
      end: { dateTime: addHours(now, 3).toISOString() },
      iCalUID: 'future@google.com',
      sequence: 0,
      reminders: {},
    }

    mockFetchAllCalendarEvents.mockResolvedValue({
      start: now.toISOString().split('T')[0],
      end: addHours(now, 18).toISOString().split('T')[0],
      allEvents: [futureEvent, currentEvent],
    })

    const result = await getNextUpcomingEvent()

    expect(result).not.toBeNull()
    expect(result?.id).toBe('current-event-id')
  })

  it('should return future event when no current event exists', async () => {
    const now = new Date()

    const futureEvent: GoogleCalendarV3Event = {
      kind: 'calendar#event',
      etag: 'etag-future',
      id: 'future-event-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=future',
      created: subHours(now, 24).toISOString(),
      updated: subHours(now, 24).toISOString(),
      summary: 'Future Session__EVENT__',
      start: { dateTime: addHours(now, 2).toISOString() },
      end: { dateTime: addHours(now, 3).toISOString() },
      iCalUID: 'future@google.com',
      sequence: 0,
      reminders: {},
    }

    mockFetchAllCalendarEvents.mockResolvedValue({
      start: now.toISOString().split('T')[0],
      end: addHours(now, 18).toISOString().split('T')[0],
      allEvents: [futureEvent],
    })

    const result = await getNextUpcomingEvent()

    expect(result).not.toBeNull()
    expect(result?.id).toBe('future-event-id')
  })

  it('should NOT return event that already ended', async () => {
    const now = new Date()

    const pastEvent: GoogleCalendarV3Event = {
      kind: 'calendar#event',
      etag: 'etag-past',
      id: 'past-event-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=past',
      created: subHours(now, 24).toISOString(),
      updated: subHours(now, 24).toISOString(),
      summary: 'Past Session__EVENT__',
      start: { dateTime: subHours(now, 2).toISOString() },
      end: { dateTime: subHours(now, 1).toISOString() },
      iCalUID: 'past@google.com',
      sequence: 0,
      reminders: {},
    }

    mockFetchAllCalendarEvents.mockResolvedValue({
      start: now.toISOString().split('T')[0],
      end: addHours(now, 18).toISOString().split('T')[0],
      allEvents: [pastEvent],
    })

    const result = await getNextUpcomingEvent()

    expect(result).toBeNull()
  })

  it('should exclude events with next-exclude__EVENT__ marker even if in progress', async () => {
    const now = new Date()

    const excludedCurrentEvent: GoogleCalendarV3Event = {
      kind: 'calendar#event',
      etag: 'etag-excluded',
      id: 'excluded-event-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=excluded',
      created: subHours(now, 24).toISOString(),
      updated: subHours(now, 24).toISOString(),
      summary: 'Excluded Session next-exclude__EVENT__',
      start: { dateTime: subMinutes(now, 30).toISOString() },
      end: { dateTime: addMinutes(now, 30).toISOString() },
      iCalUID: 'excluded@google.com',
      sequence: 0,
      reminders: {},
    }

    mockFetchAllCalendarEvents.mockResolvedValue({
      start: now.toISOString().split('T')[0],
      end: addHours(now, 18).toISOString().split('T')[0],
      allEvents: [excludedCurrentEvent],
    })

    const result = await getNextUpcomingEvent()

    expect(result).toBeNull()
  })
})
