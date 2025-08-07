import { describe, it, expect } from 'vitest'
import { filterEventsForQuery, filterEventsForGeneralBlocking } from '../fetchContainersByQuery'
import type { GoogleCalendarV3Event } from '@/lib/types'

describe('fetchContainersByQuery - blockingScope filter functions', () => {
  // Create minimal mock events that satisfy the GoogleCalendarV3Event type
  const createMockEvent = (summary: string, description?: string): GoogleCalendarV3Event => ({
    id: `mock-${Date.now()}-${Math.random()}`,
    summary,
    description,
    start: { dateTime: '2024-01-01T10:00:00.000Z', timeZone: 'UTC' },
    end: { dateTime: '2024-01-01T11:00:00.000Z', timeZone: 'UTC' },
    kind: 'calendar#event',
    etag: '"mock-etag"',
    status: 'confirmed',
    htmlLink: 'https://calendar.google.com/mock',
    created: '2024-01-01T00:00:00.000Z',
    updated: '2024-01-01T00:00:00.000Z',
    creator: {},
    organizer: {},
    recurringEventId: '',
    originalStartTime: {},
    iCalUID: 'mock-ical-uid',
    sequence: 0,
    reminders: { useDefault: true },
    eventType: 'default',
  })

  describe('filterEventsForQuery', () => {
    it('should filter events matching the specific query pattern', () => {
      const allEvents = [
        createMockEvent('free-30__EVENT__CONTAINER__'),
        createMockEvent('free-30__EVENT__MEMBER__'),
        createMockEvent('other-event__EVENT__CONTAINER__'),
        createMockEvent('regular meeting'),
        createMockEvent('appointment', 'free-30__EVENT__MEMBER__ in description'),
      ]

      const result = filterEventsForQuery(allEvents, 'free-30')

      expect(result.searchQuery).toBe('free-30__EVENT__')
      expect(result.eventMemberString).toBe('free-30__EVENT__MEMBER__')
      expect(result.eventContainerString).toBe('free-30__EVENT__CONTAINER__')

      // Should include events with free-30__EVENT__ in summary or description
      expect(result.events).toHaveLength(3) // Container, Member, and description match
      expect(result.events.map((e) => e.summary)).toEqual([
        'free-30__EVENT__CONTAINER__',
        'free-30__EVENT__MEMBER__',
        'appointment',
      ])

      // Should filter containers correctly
      expect(result.containers).toHaveLength(1)
      expect(result.containers[0].summary).toBe('free-30__EVENT__CONTAINER__')

      // Should filter members correctly
      expect(result.members).toHaveLength(2) // Direct match + description match
      expect(result.members.map((e) => e.summary)).toEqual([
        'free-30__EVENT__MEMBER__',
        'appointment',
      ])

      // Should create busy query from members
      expect(result.busyQuery).toHaveLength(2)
      expect(result.busyQuery[0]).toEqual({
        start: allEvents[1].start,
        end: allEvents[1].end,
      })
    })

    it('should return empty arrays when no events match', () => {
      const allEvents = [createMockEvent('regular meeting'), createMockEvent('doctor appointment')]

      const result = filterEventsForQuery(allEvents, 'free-30')

      expect(result.events).toHaveLength(0)
      expect(result.containers).toHaveLength(0)
      expect(result.members).toHaveLength(0)
      expect(result.busyQuery).toHaveLength(0)
    })
  })

  describe('filterEventsForGeneralBlocking', () => {
    it('should separate event members from regular calendar events', () => {
      const allEvents = [
        createMockEvent('free-30__EVENT__CONTAINER__'),
        createMockEvent('free-30__EVENT__MEMBER__'),
        createMockEvent('other-event__EVENT__MEMBER__'),
        createMockEvent('regular meeting'), // Regular event
        createMockEvent('doctor appointment'), // Regular event
        createMockEvent('lunch with client'), // Regular event
      ]

      const result = filterEventsForGeneralBlocking(allEvents)

      expect(result.events).toHaveLength(6) // All events for reference

      // Should find all event members (regardless of query)
      expect(result.members).toHaveLength(2)
      expect(result.members.map((e) => e.summary)).toEqual([
        'free-30__EVENT__MEMBER__',
        'other-event__EVENT__MEMBER__',
      ])

      // Should find all regular events (not containing __EVENT__)
      expect(result.regularEvents).toHaveLength(3)
      expect(result.regularEvents.map((e) => e.summary)).toEqual([
        'regular meeting',
        'doctor appointment',
        'lunch with client',
      ])

      // Should combine both types for blocking
      expect(result.blockingEvents).toHaveLength(5) // 2 members + 3 regular
      expect(result.blockingEvents.map((e) => e.summary)).toEqual([
        'free-30__EVENT__MEMBER__',
        'other-event__EVENT__MEMBER__',
        'regular meeting',
        'doctor appointment',
        'lunch with client',
      ])

      // Should create busy query from all blocking events
      expect(result.busyQuery).toHaveLength(5)
    })

    it('should handle events with __EVENT__ in description but not summary', () => {
      const allEvents = [
        createMockEvent('meeting notes', 'Contains __EVENT__MEMBER__ in description'),
        createMockEvent('regular meeting'),
      ]

      const result = filterEventsForGeneralBlocking(allEvents)

      // Event with __EVENT__MEMBER__ in description should be treated as a member event
      expect(result.members).toHaveLength(1)
      expect(result.members[0].summary).toBe('meeting notes')

      // Only truly regular events (no __EVENT__ anywhere) count as regular
      expect(result.regularEvents).toHaveLength(1)
      expect(result.regularEvents[0].summary).toBe('regular meeting')
    })

    it('should exclude container events from blocking but include all others', () => {
      const allEvents = [
        createMockEvent('free-30__EVENT__CONTAINER__'), // Should be excluded from blocking
        createMockEvent('free-30__EVENT__MEMBER__'), // Should block
        createMockEvent('regular meeting'), // Should block
      ]

      const result = filterEventsForGeneralBlocking(allEvents)

      // Container events are excluded from blocking
      expect(result.blockingEvents).toHaveLength(2)
      expect(result.blockingEvents.map((e) => e.summary)).toEqual([
        'free-30__EVENT__MEMBER__',
        'regular meeting',
      ])

      expect(result.busyQuery).toHaveLength(2)
    })
  })

  describe('integration scenarios', () => {
    it('should handle mixed event types correctly for general blocking', () => {
      const allEvents = [
        createMockEvent('free-30__EVENT__CONTAINER__'), // Container
        createMockEvent('free-30__EVENT__MEMBER__'), // Member
        createMockEvent('paid-60__EVENT__CONTAINER__'), // Different container
        createMockEvent('paid-60__EVENT__MEMBER__'), // Different member
        createMockEvent('team standup'), // Regular event
        createMockEvent('client call'), // Regular event
      ]

      // Test specific query filtering
      const queryResult = filterEventsForQuery(allEvents, 'free-30')
      expect(queryResult.events).toHaveLength(2) // Only free-30 events
      expect(queryResult.containers).toHaveLength(1) // Only free-30 container
      expect(queryResult.members).toHaveLength(1) // Only free-30 member

      // Test general blocking
      const generalResult = filterEventsForGeneralBlocking(allEvents)
      expect(generalResult.members).toHaveLength(2) // All member events
      expect(generalResult.regularEvents).toHaveLength(2) // All regular events
      expect(generalResult.blockingEvents).toHaveLength(4) // All non-container events
    })
  })
})
