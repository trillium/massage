import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isRequestEvent,
  getCleanSummary,
  extractApprovalUrls,
  categorizeEvents,
} from '@/lib/helpers/eventHelpers'
import { GoogleCalendarV3Event } from '@/lib/types'

function makeEvent(overrides: Partial<GoogleCalendarV3Event> = {}): GoogleCalendarV3Event {
  return {
    id: 'evt-1',
    summary: '60min massage w/ Alice',
    start: { dateTime: '2025-06-15T10:00:00Z' },
    end: { dateTime: '2025-06-15T11:00:00Z' },
    kind: 'calendar#event',
    etag: '"abc"',
    status: 'confirmed',
    htmlLink: '',
    created: '2025-06-01T00:00:00Z',
    updated: '2025-06-01T00:00:00Z',
    iCalUID: 'uid@google.com',
    sequence: 0,
    reminders: {},
    ...overrides,
  }
}

describe('isRequestEvent', () => {
  it('returns true when summary starts with REQUEST: ', () => {
    const event = makeEvent({ summary: 'REQUEST: 60min massage w/ Alice' })
    expect(isRequestEvent(event)).toBe(true)
  })

  it('returns false for normal event', () => {
    const event = makeEvent({ summary: '60min massage w/ Alice' })
    expect(isRequestEvent(event)).toBe(false)
  })

  it('returns false when REQUEST is not a prefix', () => {
    const event = makeEvent({ summary: 'Not a REQUEST: event' })
    expect(isRequestEvent(event)).toBe(false)
  })
})

describe('getCleanSummary', () => {
  it('strips REQUEST: prefix from pending events', () => {
    const event = makeEvent({ summary: 'REQUEST: 60min massage w/ Alice' })
    expect(getCleanSummary(event)).toBe('60min massage w/ Alice')
  })

  it('returns summary unchanged for normal events', () => {
    const event = makeEvent({ summary: '60min massage w/ Alice' })
    expect(getCleanSummary(event)).toBe('60min massage w/ Alice')
  })

  it('returns "Untitled Event" when summary is empty', () => {
    const event = makeEvent({ summary: '' })
    expect(getCleanSummary(event)).toBe('Untitled Event')
  })
})

describe('extractApprovalUrls', () => {
  it('extracts accept and decline URLs from description HTML', () => {
    const description = [
      'PENDING REQUEST\n',
      '<b><a href="https://example.com/api/confirm?data=abc&key=xyz">Accept</a></b>\n',
      '<b><a href="https://example.com/api/decline?data=abc&key=xyz">Decline</a></b>\n',
    ].join('')

    const { acceptUrl, declineUrl } = extractApprovalUrls(description)
    expect(acceptUrl).toBe('https://example.com/api/confirm?data=abc&key=xyz')
    expect(declineUrl).toBe('https://example.com/api/decline?data=abc&key=xyz')
  })

  it('returns nulls when no URLs found', () => {
    const { acceptUrl, declineUrl } = extractApprovalUrls('Just some text')
    expect(acceptUrl).toBeNull()
    expect(declineUrl).toBeNull()
  })

  it('returns nulls for undefined description', () => {
    const { acceptUrl, declineUrl } = extractApprovalUrls(undefined)
    expect(acceptUrl).toBeNull()
    expect(declineUrl).toBeNull()
  })
})

describe('categorizeEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('separates REQUEST events into pendingEvents', () => {
    const pending = makeEvent({
      id: 'p1',
      summary: 'REQUEST: 60min massage w/ Alice',
      start: { dateTime: '2025-06-16T10:00:00Z' },
    })
    const future = makeEvent({
      id: 'f1',
      summary: '60min massage w/ Bob',
      start: { dateTime: '2025-06-16T10:00:00Z' },
    })

    const result = categorizeEvents([pending, future])

    expect(result.pendingEvents).toHaveLength(1)
    expect(result.pendingEvents[0].id).toBe('p1')
    expect(result.futureEvents).toHaveLength(1)
    expect(result.futureEvents[0].id).toBe('f1')
  })

  it('still categorizes today, future, and past events', () => {
    const today = makeEvent({
      id: 't1',
      summary: 'Today massage',
      start: { dateTime: '2025-06-15T14:00:00Z' },
    })
    const future = makeEvent({
      id: 'f1',
      summary: 'Future massage',
      start: { dateTime: '2025-06-20T10:00:00Z' },
    })
    const past = makeEvent({
      id: 'p1',
      summary: 'Past massage',
      start: { dateTime: '2025-06-10T10:00:00Z' },
    })

    const result = categorizeEvents([today, future, past])

    expect(result.todayEvents).toHaveLength(1)
    expect(result.futureEvents).toHaveLength(1)
    expect(result.pastEvents).toHaveLength(1)
    expect(result.pendingEvents).toHaveLength(0)
  })

  it('sorts pending events by date ascending', () => {
    const later = makeEvent({
      id: 'p2',
      summary: 'REQUEST: Later',
      start: { dateTime: '2025-06-20T10:00:00Z' },
    })
    const earlier = makeEvent({
      id: 'p1',
      summary: 'REQUEST: Earlier',
      start: { dateTime: '2025-06-17T10:00:00Z' },
    })

    const result = categorizeEvents([later, earlier])

    expect(result.pendingEvents[0].id).toBe('p1')
    expect(result.pendingEvents[1].id).toBe('p2')
  })

  it('skips CURRENT_LOCATION events', () => {
    const location = makeEvent({ summary: 'CURRENT_LOCATION' })
    const result = categorizeEvents([location])

    expect(result.pendingEvents).toHaveLength(0)
    expect(result.todayEvents).toHaveLength(0)
    expect(result.futureEvents).toHaveLength(0)
    expect(result.pastEvents).toHaveLength(0)
  })
})
