import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import type { SlugConfigurationType, GoogleCalendarV3Event } from '@/lib/types'

// Mock the required functions
vi.mock('../helpers/resolveConfiguration')
vi.mock('../helpers/fetchPageData')
vi.mock('@/lib/fetch/getNextUpcomingEvent')

describe('createPageConfiguration - type="next" functionality', () => {
  let mockResolveConfiguration: ReturnType<typeof vi.fn>
  let mockFetchPageData: ReturnType<typeof vi.fn>
  let mockGetNextUpcomingEvent: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()

    // Import and assign mocked functions
    const resolveConfigModule = await import('../helpers/resolveConfiguration')
    const fetchPageDataModule = await import('../helpers/fetchPageData')
    const getNextUpcomingEventModule = await import('@/lib/fetch/getNextUpcomingEvent')

    mockResolveConfiguration = vi.mocked(resolveConfigModule.resolveConfiguration)
    mockFetchPageData = vi.mocked(fetchPageDataModule.fetchPageData)
    mockGetNextUpcomingEvent = vi.mocked(getNextUpcomingEventModule.getNextUpcomingEvent)
  })

  const mockSearchParams = {
    duration: '60',
    date: '2025-09-06',
  }

  const baseNextConfig: SlugConfigurationType = {
    type: 'next',
    bookingSlug: null,
    title: 'Book Next Available',
    text: 'Book your next available appointment',
    location: null,
    eventContainer: null, // Add this required property
    pricing: null,
    discount: null,
    leadTimeMinimum: null,
    allowedDurations: null,
    instantConfirm: true,
    acceptingPayment: true,
  }

  const mockUpcomingEvent: GoogleCalendarV3Event = {
    kind: 'calendar#event',
    etag: 'etag-123',
    id: 'upcoming-event-id',
    status: 'confirmed',
    htmlLink: 'https://calendar.google.com/event?eid=upcoming-event-id',
    created: '2025-09-01T00:00:00.000Z',
    updated: '2025-09-01T00:00:00.000Z',
    summary: 'Massage Heather',
    description: '__EVENT__',
    location: '123 Main St, Los Angeles, CA',
    creator: { email: 'test@example.com' },
    organizer: { email: 'test@example.com' },
    start: {
      dateTime: '2025-09-06T15:00:00.000Z', // 3:00 PM
      timeZone: 'UTC',
    },
    end: {
      dateTime: '2025-09-06T16:00:00.000Z', // 4:00 PM
      timeZone: 'UTC',
    },
    iCalUID: 'upcoming-event-id@google.com',
    sequence: 0,
    reminders: { useDefault: true },
  }

  describe('When upcoming event is found', () => {
    it('should return limited availability (30 minutes) after event with multi-duration slots', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      // Mock fetchPageData to return event-found scenario
      const mockMultiDurationSlots = {
        15: [
          {
            start: '2025-09-06T16:00:00.000Z',
            end: '2025-09-06T16:15:00.000Z',
            location: '123 Main St',
          },
          {
            start: '2025-09-06T16:15:00.000Z',
            end: '2025-09-06T16:30:00.000Z',
            location: '123 Main St',
          },
        ],
        30: [
          {
            start: '2025-09-06T16:00:00.000Z',
            end: '2025-09-06T16:30:00.000Z',
            location: '123 Main St',
          },
        ],
        60: [
          {
            start: '2025-09-06T16:00:00.000Z',
            end: '2025-09-06T17:00:00.000Z',
            location: '123 Main St',
          },
        ],
      }

      mockFetchPageData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [],
        multiDurationSlots: mockMultiDurationSlots,
        currentEvent: mockUpcomingEvent,
        nextEventFound: true,
      })

      const result = await createPageConfiguration({
        resolvedParams: mockSearchParams,
        overrides: { type: 'next' },
      })

      expect(result.data.nextEventFound).toBe(true)
      expect(result.data.currentEvent).toEqual(mockUpcomingEvent)
      expect(result.multiDurationSlots).toEqual(mockMultiDurationSlots)

      // Should use slots from multi-duration for selected duration (60 min)
      expect(result.slots).toEqual(mockMultiDurationSlots[60])

      // Should have limited time range (same day, 30-minute window)
      // start and end are DayWithStartEnd objects with string start/end properties
      expect(result.start.start.split('T')[0]).toBe('2025-09-06')
      expect(result.end.end.split('T')[0]).toBe('2025-09-06')
    })

    it('should not offer excessive availability when event is found', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      // Mock very limited post-event availability (only 2 slots)
      const limitedSlots = {
        60: [
          {
            start: '2025-09-06T16:00:00.000Z',
            end: '2025-09-06T17:00:00.000Z',
            location: '123 Main St',
          },
          {
            start: '2025-09-06T16:15:00.000Z',
            end: '2025-09-06T17:15:00.000Z',
            location: '123 Main St',
          },
        ],
      }

      mockFetchPageData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [],
        multiDurationSlots: limitedSlots,
        currentEvent: mockUpcomingEvent,
        nextEventFound: true,
      })

      const result = await createPageConfiguration({
        resolvedParams: mockSearchParams,
        overrides: { type: 'next' },
      })

      // Should only have the limited slots, not general availability
      expect(result.slots).toHaveLength(2)
      expect(result.data.nextEventFound).toBe(true)

      // Verify no fallback to general availability
      expect(result.data.busy).toEqual([])
    })

    it('should include currentEvent in return object for display purposes', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      mockFetchPageData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [],
        multiDurationSlots: {
          60: [
            {
              start: '2025-09-06T16:00:00.000Z',
              end: '2025-09-06T17:00:00.000Z',
              location: '123 Main St',
            },
          ],
        },
        currentEvent: mockUpcomingEvent,
        nextEventFound: true,
      })

      const result = await createPageConfiguration({
        resolvedParams: mockSearchParams,
        overrides: { type: 'next' },
      })

      expect(result.currentEvent).toEqual(mockUpcomingEvent)
      expect(result.data.currentEvent).toEqual(mockUpcomingEvent)
    })
  })

  describe('When no upcoming event is found', () => {
    it('should fallback to today availability when still time remaining', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      // Mock fetchPageData to return fallback scenario for today
      mockFetchPageData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [{ start: '2025-09-06T09:00:00.000Z', end: '2025-09-06T10:00:00.000Z' }],
        nextEventFound: false,
        targetDate: '2025-09-06', // Today
      })

      const result = await createPageConfiguration({
        resolvedParams: mockSearchParams,
        overrides: { type: 'next' },
      })

      expect(result.data.nextEventFound).toBe(false)
      expect(result.data.targetDate).toBe('2025-09-06')

      // Should use regular slot creation, not multi-duration
      expect(result.multiDurationSlots).toBeUndefined()
      expect(result.currentEvent).toBeUndefined()

      // Should have regular availability structure
      expect(Array.isArray(result.data.busy)).toBe(true)
      expect(result.data.busy.length).toBeGreaterThan(0)
    })

    it('should fallback to tomorrow availability when too late for today', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      // Mock fetchPageData to return fallback scenario for tomorrow
      mockFetchPageData.mockResolvedValue({
        start: '2025-09-07',
        end: '2025-09-07',
        busy: [{ start: '2025-09-07T10:00:00.000Z', end: '2025-09-07T11:00:00.000Z' }],
        nextEventFound: false,
        targetDate: '2025-09-07', // Tomorrow
      })

      const result = await createPageConfiguration({
        resolvedParams: mockSearchParams,
        overrides: { type: 'next' },
      })

      expect(result.data.nextEventFound).toBe(false)
      expect(result.data.targetDate).toBe('2025-09-07')

      // Should target tomorrow
      expect(result.start.start.split('T')[0]).toBe('2025-09-07')
      expect(result.end.end.split('T')[0]).toBe('2025-09-07')
    })

    it('should use regular slot creation for fallback scenarios', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      mockFetchPageData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [],
        nextEventFound: false,
        targetDate: '2025-09-06',
      })

      const result = await createPageConfiguration({
        resolvedParams: mockSearchParams,
        overrides: { type: 'next' },
      })

      // Should not have multi-duration slots in fallback mode
      expect(result.multiDurationSlots).toBeUndefined()
      expect(result.currentEvent).toBeUndefined()

      // Should use regular slot structure
      expect(Array.isArray(result.slots)).toBe(true)
    })
  })

  describe('With specific event provided', () => {
    it('should use provided currentEvent and not call event detection', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      const mockProvidedEvent: GoogleCalendarV3Event = {
        ...mockUpcomingEvent,
        id: 'provided-event-id',
        summary: 'Provided Event',
      }

      mockFetchPageData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [],
        multiDurationSlots: {
          60: [
            {
              start: '2025-09-06T16:00:00.000Z',
              end: '2025-09-06T17:00:00.000Z',
              location: '123 Main St',
            },
          ],
        },
        currentEvent: mockProvidedEvent,
        nextEventFound: true,
      })

      const result = await createPageConfiguration({
        resolvedParams: mockSearchParams,
        overrides: { type: 'next' },
        currentEvent: mockProvidedEvent,
      })

      // Should use the provided event
      expect(result.currentEvent).toEqual(mockProvidedEvent)
      expect(result.data.currentEvent).toEqual(mockProvidedEvent)

      // fetchPageData should have been called with the provided event
      expect(mockFetchPageData).toHaveBeenCalledWith(
        baseNextConfig,
        mockSearchParams,
        undefined,
        undefined,
        undefined,
        mockProvidedEvent
      )
    })

    it('should use provided eventId and fetch event details', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      mockFetchPageData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [],
        multiDurationSlots: {
          60: [
            {
              start: '2025-09-06T16:00:00.000Z',
              end: '2025-09-06T17:00:00.000Z',
              location: '123 Main St',
            },
          ],
        },
        currentEvent: mockUpcomingEvent,
        nextEventFound: true,
      })

      const result = await createPageConfiguration({
        resolvedParams: mockSearchParams,
        overrides: { type: 'next' },
        eventId: 'specific-event-id',
      })

      // fetchPageData should have been called with the eventId
      expect(mockFetchPageData).toHaveBeenCalledWith(
        baseNextConfig,
        mockSearchParams,
        undefined,
        undefined,
        'specific-event-id',
        undefined
      )

      expect(result.data.nextEventFound).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty multi-duration slots gracefully', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      mockFetchPageData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [],
        multiDurationSlots: {}, // Empty slots
        currentEvent: mockUpcomingEvent,
        nextEventFound: true,
      })

      const result = await createPageConfiguration({
        resolvedParams: mockSearchParams,
        overrides: { type: 'next' },
      })

      // Should handle empty slots gracefully
      expect(result.slots).toEqual([])
      expect(result.multiDurationSlots).toEqual({})
    })

    it('should handle missing duration in multi-duration slots', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      mockFetchPageData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [],
        multiDurationSlots: {
          30: [
            {
              start: '2025-09-06T16:00:00.000Z',
              end: '2025-09-06T16:30:00.000Z',
              location: '123 Main St',
            },
          ],
          // Missing 60-minute slots that user requested
        },
        currentEvent: mockUpcomingEvent,
        nextEventFound: true,
      })

      const result = await createPageConfiguration({
        resolvedParams: { ...mockSearchParams, duration: '60' },
        overrides: { type: 'next' },
      })

      // Should handle missing duration gracefully
      expect(result.slots).toEqual([])
      expect(result.multiDurationSlots).toBeDefined()
    })
  })

  describe('Availability constraints verification', () => {
    it('should confirm limited post-event time window (not full day)', async () => {
      mockResolveConfiguration.mockResolvedValue(baseNextConfig)

      // Mock realistic 30-minute post-event window
      const restrictedSlots = {
        15: [
          {
            start: '2025-09-06T16:00:00.000Z',
            end: '2025-09-06T16:15:00.000Z',
            location: '123 Main St',
          },
          {
            start: '2025-09-06T16:15:00.000Z',
            end: '2025-09-06T16:30:00.000Z',
            location: '123 Main St',
          },
        ],
        30: [
          {
            start: '2025-09-06T16:00:00.000Z',
            end: '2025-09-06T16:30:00.000Z',
            location: '123 Main St',
          },
        ],
        // No 60+ minute slots available (would exceed 30-minute window)
        60: [],
        90: [],
        120: [],
      }

      mockFetchPageData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [],
        multiDurationSlots: restrictedSlots,
        currentEvent: mockUpcomingEvent,
        nextEventFound: true,
      })

      const result = await createPageConfiguration({
        resolvedParams: { ...mockSearchParams, duration: '60' },
        overrides: { type: 'next' },
      })

      // Should respect the 30-minute limitation
      expect(result.slots).toEqual([]) // No 60-minute slots available
      expect(result.multiDurationSlots![15]).toHaveLength(2) // Only short slots available
      expect(result.multiDurationSlots![30]).toHaveLength(1)
      expect(result.multiDurationSlots![60]).toHaveLength(0)

      // Confirm this is NOT general availability (which would have many more slots)
      const totalSlots = Object.values(result.multiDurationSlots!).flat().length
      expect(totalSlots).toBeLessThan(10) // Should be very limited
    })
  })
})
