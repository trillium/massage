import { describe, it, expect, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import configSlice, { setBlockingScope } from '@/redux/slices/configSlice'
import {
  filterEventsForQuery,
  filterEventsForGeneralBlocking,
} from '@/lib/fetch/fetchContainersByQuery'
import type { GoogleCalendarV3Event } from '@/lib/types'

describe('BlockingScope Integration Tests', () => {
  // Create a realistic scenario with multiple event types
  const createEvent = (summary: string, description?: string): GoogleCalendarV3Event => ({
    id: `event-${Math.random()}`,
    summary,
    description,
    start: { dateTime: '2024-01-01T10:00:00.000Z', timeZone: 'UTC' },
    end: { dateTime: '2024-01-01T11:00:00.000Z', timeZone: 'UTC' },
    kind: 'calendar#event',
    etag: '"etag"',
    status: 'confirmed',
    htmlLink: 'https://calendar.google.com/event',
    created: '2024-01-01T00:00:00.000Z',
    updated: '2024-01-01T00:00:00.000Z',
    creator: {},
    organizer: {},
    recurringEventId: '',
    originalStartTime: {},
    iCalUID: 'ical-uid',
    sequence: 0,
    reminders: { useDefault: true },
    eventType: 'default',
  })

  const mockCalendarEvents = [
    // free-30 booking system events
    createEvent('free-30__EVENT__CONTAINER__'),
    createEvent('free-30__EVENT__MEMBER__'),

    // paid-massage booking system events
    createEvent('paid-massage__EVENT__CONTAINER__'),
    createEvent('paid-massage__EVENT__MEMBER__'),

    // Regular calendar events (personal/business)
    createEvent('Team Meeting'),
    createEvent('Doctor Appointment'),
    createEvent('Lunch with Client'),
    createEvent('Personal Time Block'),
  ]

  it('should demonstrate event-specific blocking (default behavior)', () => {
    // Set up Redux store with default blockingScope
    const store = configureStore({
      reducer: { config: configSlice },
    })

    // Default blockingScope should be undefined (event-specific blocking)
    expect(store.getState().config.blockingScope).toBeUndefined()

    // When looking for free-30 availability with event-specific blocking
    const result = filterEventsForQuery(mockCalendarEvents, 'free-30')

    expect(result.events).toHaveLength(2) // Only free-30 events
    expect(result.members).toHaveLength(1) // Only free-30 member
    expect(result.containers).toHaveLength(1) // Only free-30 container
    expect(result.busyQuery).toHaveLength(1) // Only free-30 member blocks availability

    // Regular calendar events and other booking types don't affect free-30 availability
    const memberSummaries = result.members.map((e) => e.summary)
    expect(memberSummaries).toEqual(['free-30__EVENT__MEMBER__'])
  })

  it('should demonstrate general blocking behavior', () => {
    // Set up Redux store with general blocking scope
    const store = configureStore({
      reducer: { config: configSlice },
    })

    store.dispatch(setBlockingScope('general'))
    expect(store.getState().config.blockingScope).toBe('general')

    // When using general blocking, ALL calendar events block availability
    const result = filterEventsForGeneralBlocking(mockCalendarEvents)

    expect(result.events).toHaveLength(8) // All calendar events
    expect(result.members).toHaveLength(2) // All booking system members
    expect(result.regularEvents).toHaveLength(4) // All regular calendar events
    expect(result.blockingEvents).toHaveLength(6) // Members + Regular (excludes containers)
    expect(result.busyQuery).toHaveLength(6) // All blocking events create busy times

    // Should include both booking system events AND regular calendar events
    const blockingEventSummaries = result.blockingEvents?.map((e) => e.summary).sort() || []
    expect(blockingEventSummaries).toEqual([
      'Doctor Appointment',
      'Lunch with Client',
      'Personal Time Block',
      'Team Meeting',
      'free-30__EVENT__MEMBER__',
      'paid-massage__EVENT__MEMBER__',
    ])
  })

  it('should demonstrate the key difference between blocking scopes', () => {
    // Event-specific: Only free-30 members block free-30 availability
    const eventSpecific = filterEventsForQuery(mockCalendarEvents, 'free-30')
    expect(eventSpecific.busyQuery).toHaveLength(1) // Only free-30 member

    // General: ALL events (except containers) block availability
    const general = filterEventsForGeneralBlocking(mockCalendarEvents)
    expect(general.busyQuery).toHaveLength(6) // All members + regular events

    // This means free-30 with general blocking would show much less availability
    // because personal meetings, doctor appointments, etc. would block booking slots
  })

  it('should handle Redux state updates correctly', () => {
    const store = configureStore({
      reducer: { config: configSlice },
    })

    // Start with default (undefined)
    expect(store.getState().config.blockingScope).toBeUndefined()

    // Update to event-specific
    store.dispatch(setBlockingScope('event'))
    expect(store.getState().config.blockingScope).toBe('event')

    // Update to general
    store.dispatch(setBlockingScope('general'))
    expect(store.getState().config.blockingScope).toBe('general')

    // Reset to undefined
    store.dispatch(setBlockingScope(undefined))
    expect(store.getState().config.blockingScope).toBeUndefined()
  })

  it('should demonstrate real-world use case scenario', () => {
    // Scenario: A massage therapist offers free-30 consultations and paid-massage services
    // They want free-30 to be available even when they have personal appointments,
    // but paid-massage should respect ALL calendar events

    // For free-30 (event-specific blocking)
    const free30Result = filterEventsForQuery(mockCalendarEvents, 'free-30')
    const free30BusyTimes = free30Result.busyQuery.length

    // For paid-massage with general blocking
    const generalResult = filterEventsForGeneralBlocking(mockCalendarEvents)
    const generalBusyTimes = generalResult.busyQuery.length

    // free-30 has fewer busy times (more availability)
    expect(free30BusyTimes).toBeLessThan(generalBusyTimes)
    expect(free30BusyTimes).toBe(1) // Only free-30 existing bookings
    expect(generalBusyTimes).toBe(6) // All bookings + personal events

    // This allows flexible availability management:
    // - Quick consultations can fit around existing calendar
    // - Full services respect all time commitments
  })
})
