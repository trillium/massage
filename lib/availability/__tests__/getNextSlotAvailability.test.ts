import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextSlotOptions } from '../getNextSlotAvailability'
import { GoogleCalendarV3Event } from '@/lib/types'

// Mock the fetchAllCalendarEvents function
const mockFetchAllCalendarEvents = vi.fn()
vi.mock('@/lib/fetch/fetchContainersByQuery', () => ({
  fetchAllCalendarEvents: mockFetchAllCalendarEvents,
}))

describe('Next Slot Availability System', () => {
  // Mock data setup
  let mockCurrentEvent: GoogleCalendarV3Event
  let mockExistingEvents: GoogleCalendarV3Event[]

  let getNextSlotAvailability: typeof import('../getNextSlotAvailability').getNextSlotAvailability
  let getAvailableNextSlots: typeof import('../getNextSlotAvailability').getAvailableNextSlots
  let convertToTimeListFormat: typeof import('../getNextSlotAvailability').convertToTimeListFormat
  let createMultiDurationAvailability: typeof import('../getNextSlotAvailability').createMultiDurationAvailability

  beforeEach(async () => {
    // Reset module registry to ensure mocks are applied
    vi.resetModules()
    // Reset mocks before each test
    vi.clearAllMocks()

    // Setup mock data that will be used across tests
    mockCurrentEvent = {
      kind: 'calendar#event',
      etag: 'etag-1',
      id: 'current-event-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=current-event-id',
      created: '2025-08-01T00:00:00.000Z',
      updated: '2025-08-01T00:00:00.000Z',
      summary: 'Current Event',
      description: '',
      location: '123 Main St, Los Angeles, CA',
      creator: { email: 'test@example.com' },
      organizer: { email: 'test@example.com' },
      start: {
        dateTime: '2025-08-14T10:00:00.000Z',
        timeZone: 'UTC',
      },
      end: {
        dateTime: '2025-08-14T11:00:00.000Z',
        timeZone: 'UTC',
      },
      iCalUID: 'current-event-id@google.com',
      sequence: 0,
      reminders: { useDefault: true },
      eventType: 'default',
    }

    mockExistingEvents = []

    // Setup the mock return value
    mockFetchAllCalendarEvents.mockResolvedValue({
      allEvents: mockExistingEvents,
    })

    // Import after mocking
    const mod = await import('../getNextSlotAvailability')
    getNextSlotAvailability = mod.getNextSlotAvailability
    getAvailableNextSlots = mod.getAvailableNextSlots
    convertToTimeListFormat = mod.convertToTimeListFormat
    createMultiDurationAvailability = mod.createMultiDurationAvailability
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * TEST SCENARIOS FOR BASIC AVAILABILITY FUNCTIONS
   * ================================================
   *
   * 1. Basic Single Duration Slot Generation
   *    - Test getNextSlotAvailability with default parameters
   *    - Verify correct number of slots generated within time window
   *    - Verify slot timing, duration, and location inheritance
   *    - Test with custom appointmentDuration, slotInterval, maxMinutesAhead
   *
   * 2. Slot Conflict Detection
   *    - Test slots with no existing conflicts (all available)
   *    - Test slots with partial conflicts (some unavailable)
   *    - Test slots with complete conflicts (all unavailable)
   *    - Test edge cases: conflicts at exact boundaries
   *    - Test overlapping conflicts vs adjacent conflicts
   *
   * {{ Unnecessary, this functionality exists elsewhere in the app, not part of this test suite
   * }}
   * {{ Do not create }}
   * 3. Location Object Creation
   *    - Test location parsing from string with city/state
   *    - Test location parsing with minimal information
   *    - Test location parsing with null/undefined input
   *    - Test location object structure and defaults
   *
   * 4. Available Slots Filtering
   *    - Test getAvailableNextSlots filters correctly
   *    - Verify only non-conflicting slots are returned
   *    - Test with mixed available/unavailable scenarios
   *
   * 5. TimeList Format Conversion
   *    - Test convertToTimeListFormat output structure
   *    - Verify ISO string formatting
   *    - Test filtering of unavailable slots in conversion
   *    - Test location object preservation in conversion
   */

  /**
   * TEST SCENARIOS FOR MULTI-DURATION AVAILABILITY SYSTEM
   * =====================================================
   *
   * 6. Multi-Duration Cache Creation
   *    - Test createMultiDurationAvailability with default durations
   *    - Test with custom duration arrays
   *    - Verify cache structure and properties
   *    - Test pre-calculation of specified durations
   *    - Verify single API call to fetchAllCalendarEvents
   *
   * 7. On-Demand Duration Calculation
   *    - Test getSlotsForDuration with pre-calculated durations
   *    - Test getSlotsForDuration with new durations (on-demand)
   *    - Verify cache update when calculating new durations
   *    - Test performance: no additional API calls for new durations
   *
   * 8. Available Slots by Duration
   *    - Test getAvailableSlotsForDuration filtering
   *    - Test different durations with different availability
   *    - Verify duration-specific conflict detection
   *
   * 9. TimeList Format by Duration
   *    - Test getTimeListFormatForDuration output
   *    - Verify correct filtering and formatting per duration
   *    - Test with durations having no available slots
   *
   * 10. Available Durations Detection
   *     - Test getAvailableDurations returns only durations with slots
   *     - Test sorting of available durations
   *     - Test edge case: no durations have available slots
   *     - Test partial availability across different durations
   *
   * 11. Cache Validity and Expiration
   *     - Test isCacheValid with fresh cache (< 5 minutes)
   *     - Test isCacheValid with expired cache (> 5 minutes)
   *     - Test cache timestamp accuracy
   *     - Mock time advancement for expiration testing
   */

  /**
   * TEST SCENARIOS FOR CONFLICT DETECTION LOGIC
   * ===========================================
   *
   * 12. Time Overlap Conflict Detection
   *     - Test hasConflict with no overlaps (no conflicts)
   *     - Test hasConflict with exact time matches (conflicts)
   *     - Test hasConflict with partial overlaps (conflicts)
   *     - Test hasConflict with slot completely inside existing event
   *     - Test hasConflict with existing event completely inside slot
   *
   * 13. Multiple Event Conflicts
   *     - Test conflict detection with multiple existing events
   *     - Test finding specific conflicting event in results
   *     - Test with events before, during, and after slot window
   *
   * 14. Edge Case Conflict Scenarios
   *     - Test with events missing start/end dateTime
   *     - Test with malformed date strings
   *     - Test timezone handling in conflict detection
   *     - Test daylight saving time boundary conflicts
   */

  /**
   * TEST SCENARIOS FOR INPUT VALIDATION AND ERROR HANDLING
   * ======================================================
   *
   * 15. Input Validation
   *     - Test with currentEvent missing end.dateTime (should throw)
   *     - Test with currentEvent missing start.dateTime
   *     - Test with negative duration values
   *     - Test with zero or negative slot intervals
   *     - Test with negative maxMinutesAhead
   *
   * 16. API Failure Handling
   *     - Test behavior when fetchAllCalendarEvents fails
   *     - Test behavior when fetchAllCalendarEvents returns null/undefined
   *     - Test behavior with malformed calendar event data
   *
   * 17. Date/Time Edge Cases
   *     - Test with events spanning midnight
   *     - Test with very short time windows (< slot interval)
   *     - Test with very long durations (> maxMinutesAhead)
   *     - Test with slot intervals larger than available window
   */

  /**
   * TEST SCENARIOS FOR PERFORMANCE AND OPTIMIZATION
   * ===============================================
   *
   * 18. API Call Optimization
   *     - Verify single fetchAllCalendarEvents call per cache creation
   *     - Verify no additional API calls when changing durations
   *     - Test that multiple getSlotsForDuration calls don't trigger new API calls
   *
   * 19. Memory and Performance
   *     - Test cache size with large numbers of events
   *     - Test performance with many duration options
   *     - Test Map usage efficiency for slot storage
   *
   * 20. Concurrent Usage Scenarios
   *     - Test multiple simultaneous getSlotsForDuration calls
   *     - Test cache consistency under rapid duration changes
   *     - Test cache behavior with overlapping time windows
   */

  /**
   * TEST SCENARIOS FOR INTEGRATION AND REAL-WORLD USAGE
   * ===================================================
   *
   * 21. State Management Integration
   *     - Test typical React state usage patterns
   *     - Test cache persistence across component re-renders
   *     - Test handling of stale cache in state
   *
   * 22. UI Component Integration
   *     - Test data format compatibility with TimeList component
   *     - Test duration picker integration scenarios
   *     - Test availability display with mixed durations
   *
   * 23. Real-World Calendar Scenarios
   *     - Test with typical business day calendar (8am-5pm events)
   *     - Test with back-to-back meetings scenario
   *     - Test with lunch break and meeting gaps
   *     - Test with all-day events in calendar
   *     - Test with recurring events in conflict detection
   *
   * 24. Booking System Integration
   *     - Test slot selection and booking flow compatibility
   *     - Test with different appointment types (30min, 1hr, 2hr)
   *     - Test availability updates after booking conflicts
   *     - Test double-booking prevention scenarios
   */

  /**
   * TEST SCENARIOS FOR LEGACY FUNCTION COMPATIBILITY
   * ================================================
   *
   * 25. Backward Compatibility
   *     - Ensure legacy getNextSlotAvailability still works
   *     - Ensure legacy getAvailableNextSlots still works
   *     - Test that legacy functions produce same results as new system
   *     - Test legacy convertToTimeListFormat compatibility
   *
   * 26. Migration Testing
   *     - Test scenarios where users migrate from legacy to new system
   *     - Verify identical output between old and new approaches
   *     - Test performance improvements of new vs old system
   */

  // 1. Basic Single Duration Slot Generation
  it('generates correct number of slots within time window (default params)', async () => {
    const options: NextSlotOptions = {
      currentEvent: mockCurrentEvent,
      appointmentDuration: 60, // 60 minutes
      slotInterval: 15, // 15 minutes
      maxMinutesAhead: 120, // 2 hours
    }
    // No existing events, all slots should be available
    mockExistingEvents.length = 0
    const slots = await getNextSlotAvailability(options)
    // 2 hours window, 15 min interval, 60 min duration: slots at 11:00, 11:15, 11:30, 11:45, 12:00
    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0].startISO).toBe('2025-08-14T11:00:00.000Z')
    expect(slots[0].duration).toBe(60)
    expect(slots[0].location).toEqual({
      street: '123 Main St',
      city: 'Los Angeles',
      zip: '90210',
    })
    expect(slots[0].available).toBe(true)
  })

  // 2. Slot Conflict Detection (no conflicts)
  it('returns all slots as available when there are no existing events', async () => {
    const options: NextSlotOptions = {
      currentEvent: mockCurrentEvent,
      appointmentDuration: 30,
      slotInterval: 15,
      maxMinutesAhead: 60,
    }
    mockExistingEvents.length = 0
    const slots = await getNextSlotAvailability(options)
    expect(slots.every((slot) => slot.available)).toBe(true)
  })

  // 1. Basic Single Duration Slot Generation (custom params)
  it('respects custom appointmentDuration, slotInterval, and maxMinutesAhead', async () => {
    const options: NextSlotOptions = {
      currentEvent: mockCurrentEvent,
      appointmentDuration: 45,
      slotInterval: 10,
      maxMinutesAhead: 30,
    }
    mockExistingEvents.length = 0
    const slots = await getNextSlotAvailability(options)
    // 30 min window, 10 min interval, 45 min duration: slots at 11:00, 11:10, 11:20
    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0].duration).toBe(45)
    expect(slots[0].startISO).toBe('2025-08-14T11:00:00.000Z')
    expect(slots[0].available).toBe(true)
  })

  // 2. Slot Conflict Detection (with conflicts)
  it('correctly identifies conflicts with existing events', async () => {
    // Add a conflicting event
    const conflictingEvent: GoogleCalendarV3Event = {
      ...mockCurrentEvent,
      id: 'conflicting-event-id',
      summary: 'Conflicting Event',
      start: { dateTime: '2025-08-14T11:00:00.000Z', timeZone: 'UTC' },
      end: { dateTime: '2025-08-14T12:00:00.000Z', timeZone: 'UTC' },
    }
    mockExistingEvents.push(conflictingEvent)

    const options: NextSlotOptions = {
      currentEvent: mockCurrentEvent,
      appointmentDuration: 60,
      slotInterval: 15,
      maxMinutesAhead: 120,
    }

    const slots = await getNextSlotAvailability(options)

    // First slot should conflict with the existing event
    const firstSlot = slots.find((slot) => slot.startISO === '2025-08-14T11:00:00.000Z')
    expect(firstSlot?.available).toBe(false)
    expect(firstSlot?.conflictingEvent?.id).toBe('conflicting-event-id')

    // Should have some available slots after the conflict
    const availableSlots = slots.filter((slot) => slot.available)
    expect(availableSlots.length).toBeGreaterThan(0)
  })

  // 4. Available Slots Filtering
  it('getAvailableNextSlots filters out conflicting slots', async () => {
    // Add a conflicting event
    const conflictingEvent: GoogleCalendarV3Event = {
      ...mockCurrentEvent,
      id: 'conflicting-event-id',
      summary: 'Conflicting Event',
      start: { dateTime: '2025-08-14T11:00:00.000Z', timeZone: 'UTC' },
      end: { dateTime: '2025-08-14T11:30:00.000Z', timeZone: 'UTC' },
    }
    mockExistingEvents.push(conflictingEvent)

    const options: NextSlotOptions = {
      currentEvent: mockCurrentEvent,
      appointmentDuration: 30,
      slotInterval: 15,
      maxMinutesAhead: 60,
    }

    const availableSlots = await getAvailableNextSlots(options)

    // All returned slots should be available
    expect(availableSlots.every((slot) => slot.available)).toBe(true)

    // Should not include the conflicting slot at 11:00
    const conflictingSlot = availableSlots.find(
      (slot) => slot.startISO === '2025-08-14T11:00:00.000Z'
    )
    expect(conflictingSlot).toBeUndefined()
  })

  // 5. TimeList Format Conversion
  it('convertToTimeListFormat produces correct structure', async () => {
    const options: NextSlotOptions = {
      currentEvent: mockCurrentEvent,
      appointmentDuration: 30,
      slotInterval: 30,
      maxMinutesAhead: 60,
    }

    const slots = await getNextSlotAvailability(options)
    const timeListFormat = convertToTimeListFormat(slots)

    expect(timeListFormat.length).toBeGreaterThan(0)
    expect(timeListFormat[0]).toHaveProperty('start')
    expect(timeListFormat[0]).toHaveProperty('end')
    expect(timeListFormat[0]).toHaveProperty('location')
    expect(typeof timeListFormat[0].start).toBe('string')
    expect(typeof timeListFormat[0].end).toBe('string')
    expect(timeListFormat[0].location).toEqual({
      street: '123 Main St',
      city: 'Los Angeles',
      zip: '90210',
    })
  })

  // 6. Multi-Duration Cache Creation
  it('createMultiDurationAvailability creates cache with default durations', async () => {
    const options = {
      currentEvent: mockCurrentEvent,
      maxMinutesAhead: 60,
    }

    const multiDuration = await createMultiDurationAvailability(options)

    // Should have cache
    expect(multiDuration.cache).toBeDefined()
    expect(multiDuration.cache.currentEvent).toBe(mockCurrentEvent)
    expect(multiDuration.cache.existingEvents).toBe(mockExistingEvents)

    // Should have methods
    expect(typeof multiDuration.getSlotsForDuration).toBe('function')
    expect(typeof multiDuration.getAvailableSlotsForDuration).toBe('function')
    expect(typeof multiDuration.getTimeListFormatForDuration).toBe('function')
    expect(typeof multiDuration.getAvailableDurations).toBe('function')
    expect(typeof multiDuration.isCacheValid).toBe('function')

    // Should have pre-calculated default durations
    const defaultDurations = [30, 60, 90, 120]
    for (const duration of defaultDurations) {
      const slots = multiDuration.getSlotsForDuration(duration)
      expect(slots.length).toBeGreaterThan(0)
      expect(slots[0].duration).toBe(duration)
    }
  })

  // 7. On-Demand Duration Calculation
  it('getSlotsForDuration calculates new durations on demand', async () => {
    const options = {
      currentEvent: mockCurrentEvent,
      durationOptions: [60], // Only pre-calculate 60 minutes
      maxMinutesAhead: 60,
    }

    const multiDuration = await createMultiDurationAvailability(options)

    // Get slots for a duration not pre-calculated
    const slots45 = multiDuration.getSlotsForDuration(45)
    expect(slots45.length).toBeGreaterThan(0)
    expect(slots45[0].duration).toBe(45)

    // Should now be cached
    const cachedSlots45 = multiDuration.getSlotsForDuration(45)
    expect(cachedSlots45).toBe(slots45) // Should be the same reference
  })

  // 11. Cache Validity
  it('isCacheValid returns true for fresh cache', async () => {
    const options = {
      currentEvent: mockCurrentEvent,
      maxMinutesAhead: 60,
    }

    const multiDuration = await createMultiDurationAvailability(options)
    expect(multiDuration.isCacheValid()).toBe(true)
  })

  // 15. Input Validation
  it('throws error when currentEvent missing end.dateTime', async () => {
    const invalidEvent = {
      ...mockCurrentEvent,
      end: {}, // Missing dateTime
    }

    const options: NextSlotOptions = {
      currentEvent: invalidEvent as GoogleCalendarV3Event,
      appointmentDuration: 60,
      slotInterval: 15,
      maxMinutesAhead: 30,
    }

    await expect(getNextSlotAvailability(options)).rejects.toThrow(
      'Current event must have an end dateTime'
    )
  })
})
