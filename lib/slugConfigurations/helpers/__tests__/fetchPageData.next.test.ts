import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchPageData } from '@/lib/slugConfigurations/helpers/fetchPageData'
import type { SlugConfigurationType, GoogleCalendarV3Event } from '@/lib/types'

// Mock the required functions
vi.mock('@/lib/fetch/getNextUpcomingEvent')
vi.mock('@/lib/fetch/fetchSingleEvent')
vi.mock('@/lib/availability/getNextSlotAvailability')
vi.mock('@/lib/fetch/fetchData')

describe('fetchPageData - type="next" availability constraints', () => {
  let mockGetNextUpcomingEvent: ReturnType<typeof vi.fn>
  let mockFetchSingleEvent: ReturnType<typeof vi.fn>
  let mockCreateMultiDurationAvailability: ReturnType<typeof vi.fn>
  let mockFetchData: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()

    // Import and assign mocked functions
    const getNextUpcomingEventModule = await import('@/lib/fetch/getNextUpcomingEvent')
    const fetchSingleEventModule = await import('@/lib/fetch/fetchSingleEvent')
    const getNextSlotModule = await import('@/lib/availability/getNextSlotAvailability')
    const fetchDataModule = await import('@/lib/fetch/fetchData')

    mockGetNextUpcomingEvent = vi.mocked(getNextUpcomingEventModule.getNextUpcomingEvent)
    mockFetchSingleEvent = vi.mocked(fetchSingleEventModule.fetchSingleEvent)
    mockCreateMultiDurationAvailability = vi.mocked(
      getNextSlotModule.createMultiDurationAvailability
    )
    mockFetchData = vi.mocked(fetchDataModule.fetchData)
  })

  const mockSearchParams = {
    duration: '60',
    date: '2025-09-06',
  }

  const nextConfig: SlugConfigurationType = {
    type: 'next',
    bookingSlug: null,
    eventContainer: null,
    title: 'Book Next Available',
    text: null,
    location: null,
    pricing: null,
    discount: null,
    leadTimeMinimum: null,
    allowedDurations: null,
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
      dateTime: '2025-09-06T15:00:00.000Z',
    },
    end: {
      dateTime: '2025-09-06T16:00:00.000Z',
    },
    iCalUID: 'upcoming-event-id@google.com',
    sequence: 0,
    reminders: { useDefault: true },
  }

  describe('Event found - Limited availability constraints', () => {
    it('should limit availability to exactly 30 minutes after event ends', async () => {
      mockGetNextUpcomingEvent.mockResolvedValue(mockUpcomingEvent)

      // Mock the multi-duration availability creation
      const mockAvailabilitySystem = {
        getTimeListFormatForDuration: vi.fn(),
      }

      // Mock limited slots for different durations within 30-minute window
      mockAvailabilitySystem.getTimeListFormatForDuration
        .mockReturnValueOnce([
          // 60-minute slots (none fit in 30-minute window)
        ])
        .mockReturnValueOnce([
          // 90-minute slots (none fit in 30-minute window)
        ])
        .mockReturnValueOnce([
          // 120-minute slots (none fit in 30-minute window)
        ])
        .mockReturnValueOnce([
          // 150-minute slots (none fit in 30-minute window)
        ])
        .mockReturnValueOnce([
          // 60-minute slots (none fit in 30-minute window)
        ])
        .mockReturnValueOnce([
          // 90-minute slots (none fit in 30-minute window)
        ])
        .mockReturnValueOnce([
          // 120-minute slots (none fit in 30-minute window)
        ])

      mockCreateMultiDurationAvailability.mockResolvedValue(mockAvailabilitySystem)

      const result = await fetchPageData(nextConfig, mockSearchParams)

      // Verify the system was called with correct constraints
      expect(mockCreateMultiDurationAvailability).toHaveBeenCalledWith({
        currentEvent: mockUpcomingEvent,
        durationOptions: [60, 90, 120, 150], // ALLOWED_DURATIONS
        slotInterval: 15,
        maxMinutesAhead: 30, // KEY CONSTRAINT: Only 30 minutes
      })

      // Verify limited time window in response
      expect(result.start).toBe('2025-09-06') // Event end date
      expect(result.end).toBe('2025-09-06') // Same day (30-minute window)
      expect(result.nextEventFound).toBe(true)
      expect(result.currentEvent).toEqual(mockUpcomingEvent)

      // Verify multi-duration slots are properly limited
      expect(result.multiDurationSlots).toBeDefined()
      expect(result.multiDurationSlots![60]).toHaveLength(0) // 60-min slots don't fit in 30-min window
      expect(result.multiDurationSlots![90]).toHaveLength(0) // 90-min slots don't fit in 30-min window
      expect(result.multiDurationSlots![120]).toHaveLength(0) // 120-min slots don't fit in 30-min window
    })

    it('should NOT offer full-day availability when event is found', async () => {
      mockGetNextUpcomingEvent.mockResolvedValue(mockUpcomingEvent)

      const mockAvailabilitySystem = {
        getTimeListFormatForDuration: vi.fn().mockReturnValue([
          // Very limited slots - just 1 slot after event
          {
            start: '2025-09-06T16:00:00.000Z',
            end: '2025-09-06T17:00:00.000Z',
            location: '123 Main St',
          },
        ]),
      }

      mockCreateMultiDurationAvailability.mockResolvedValue(mockAvailabilitySystem)

      const result = await fetchPageData(nextConfig, mockSearchParams)

      // Should NOT call fetchData for general availability
      expect(mockFetchData).not.toHaveBeenCalled()

      // Should have very limited slots (not a full day's worth)
      const totalSlotsAcrossAllDurations = Object.values(result.multiDurationSlots!).flat().length

      expect(totalSlotsAcrossAllDurations).toBeLessThan(20) // Should be very limited

      // Should not have busy slots (uses multi-duration instead)
      expect(result.busy).toEqual([])
    })

    it('should use provided currentEvent without refetching', async () => {
      const providedEvent: GoogleCalendarV3Event = {
        ...mockUpcomingEvent,
        id: 'provided-event-id',
        summary: 'Provided Event',
      }

      const mockAvailabilitySystem = {
        getTimeListFormatForDuration: vi.fn().mockReturnValue([
          {
            start: '2025-09-06T16:00:00.000Z',
            end: '2025-09-06T16:30:00.000Z',
            location: '123 Main St',
          },
        ]),
      }

      mockCreateMultiDurationAvailability.mockResolvedValue(mockAvailabilitySystem)

      const result = await fetchPageData(
        nextConfig,
        mockSearchParams,
        undefined,
        undefined,
        undefined,
        providedEvent
      )

      // Should NOT call getNextUpcomingEvent when event is provided
      expect(mockGetNextUpcomingEvent).not.toHaveBeenCalled()

      // Should use the provided event
      expect(result.currentEvent).toEqual(providedEvent)
      expect(result.nextEventFound).toBe(true)
    })

    it('should fetch single event when eventId is provided', async () => {
      const eventId = 'specific-event-id'
      mockFetchSingleEvent.mockResolvedValue(mockUpcomingEvent)

      const mockAvailabilitySystem = {
        getTimeListFormatForDuration: vi.fn().mockReturnValue([]),
      }

      mockCreateMultiDurationAvailability.mockResolvedValue(mockAvailabilitySystem)

      const result = await fetchPageData(
        nextConfig,
        mockSearchParams,
        undefined,
        undefined,
        eventId
      )

      // Should call fetchSingleEvent with provided ID
      expect(mockFetchSingleEvent).toHaveBeenCalledWith(eventId)

      // Should NOT call getNextUpcomingEvent when eventId is provided
      expect(mockGetNextUpcomingEvent).not.toHaveBeenCalled()

      expect(result.currentEvent).toEqual(mockUpcomingEvent)
      expect(result.nextEventFound).toBe(true)
    })

    it('should throw error when eventId is provided but event not found', async () => {
      const eventId = 'non-existent-event-id'
      mockFetchSingleEvent.mockResolvedValue(null)

      await expect(
        fetchPageData(nextConfig, mockSearchParams, undefined, undefined, eventId)
      ).rejects.toThrow('Event not found: non-existent-event-id')
    })
  })

  describe('No event found - Smart fallback constraints', () => {
    beforeEach(() => {
      // Mock current time to control the today/tomorrow logic
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should offer today availability when there is still time (before 8 PM)', async () => {
      // Mock current time: 2 PM (14:00) - plenty of time left today
      const mockNow = new Date('2025-09-06T14:00:00.000Z')
      vi.setSystemTime(mockNow)

      mockGetNextUpcomingEvent.mockResolvedValue(null) // No event found

      mockFetchData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06',
        busy: [{ start: '2025-09-06T09:00:00.000Z', end: '2025-09-06T10:00:00.000Z' }],
      })

      const result = await fetchPageData(nextConfig, mockSearchParams)

      // Should target today
      expect(result.targetDate).toBe('2025-09-06')
      expect(result.nextEventFound).toBe(false)

      // Should call fetchData with 2-day range to check availability, then constrain result to today
      expect(mockFetchData).toHaveBeenCalledWith({
        searchParams: {
          ...mockSearchParams,
          start: '2025-09-06',
          end: '2025-09-08', // Fetch 2 days to check availability
        },
      })
    })

    it('should offer tomorrow availability when too late for today (after 8 PM)', async () => {
      // Mock current time: 11:30 PM - definitely too late for today
      // (current + 3hrs = 2:30 AM next day > 11 PM closing)
      const mockNow = new Date('2025-09-06T23:30:00')
      vi.setSystemTime(mockNow)

      mockGetNextUpcomingEvent.mockResolvedValue(null) // No event found

      mockFetchData.mockResolvedValue({
        start: '2025-09-07',
        end: '2025-09-07',
        busy: [{ start: '2025-09-07T10:00:00.000Z', end: '2025-09-07T11:00:00.000Z' }],
      })

      const result = await fetchPageData(nextConfig, mockSearchParams)

      // Should target tomorrow
      expect(result.targetDate).toBe('2025-09-07')
      expect(result.nextEventFound).toBe(false)

      // Should call fetchData with 2-day range to check availability, then constrain result to tomorrow
      expect(mockFetchData).toHaveBeenCalledWith({
        searchParams: {
          ...mockSearchParams,
          start: '2025-09-06', // Always start from today
          end: '2025-09-08', // Fetch 2 days to check availability
        },
      })
    })

    it('should offer tomorrow availability at 7:22 PM LA time (realistic late evening scenario)', async () => {
      // Mock current time: 7:22 PM Pacific on September 6, 2025
      // In UTC this is 7:22 PM PDT = UTC-7 = 2:22 AM UTC on September 7th
      // At 7:22 PM + 3 hour lead time = 10:22 PM, there's less than 1 hour until 11 PM close
      // This should trigger tomorrow's availability since there's insufficient time for meaningful appointments
      const mockNow = new Date('2025-09-07T02:22:00.000Z') // 7:22 PM PDT = 2:22 AM UTC next day
      vi.setSystemTime(mockNow)

      mockGetNextUpcomingEvent.mockResolvedValue(null) // No event found

      mockFetchData.mockResolvedValue({
        start: '2025-09-07',
        end: '2025-09-07',
        busy: [
          { start: '2025-09-07T17:00:00.000Z', end: '2025-09-07T18:00:00.000Z' }, // Some tomorrow availability
        ],
      })

      const result = await fetchPageData(nextConfig, mockSearchParams)

      // Should target tomorrow because there's insufficient time today (< 40 minutes until close)
      expect(result.targetDate).toBe('2025-09-07')
      expect(result.nextEventFound).toBe(false)
      expect(result.start).toBe('2025-09-07')
      expect(result.end).toBe('2025-09-07')

      // Should fetch 2-day range for evaluation
      expect(mockFetchData).toHaveBeenCalledWith({
        searchParams: {
          ...mockSearchParams,
          start: '2025-09-06',
          end: '2025-09-08',
        },
      })
    })

    it('should only offer single day (not multiple days) in fallback mode', async () => {
      const mockNow = new Date('2025-09-06T14:00:00.000Z')
      vi.setSystemTime(mockNow)

      mockGetNextUpcomingEvent.mockResolvedValue(null)

      mockFetchData.mockResolvedValue({
        start: '2025-09-06',
        end: '2025-09-06', // Same day only
        busy: [],
      })

      const result = await fetchPageData(nextConfig, mockSearchParams)

      // Verify only single day offered
      expect(result.start).toBe('2025-09-06')
      expect(result.end).toBe('2025-09-06')

      // Should not have multi-duration slots in fallback mode
      expect(result.multiDurationSlots).toBeUndefined()
      expect(result.currentEvent).toBeUndefined()
    })
  })

  describe('Edge cases', () => {
    it('should handle createMultiDurationAvailability errors gracefully', async () => {
      mockGetNextUpcomingEvent.mockResolvedValue(mockUpcomingEvent)
      mockCreateMultiDurationAvailability.mockRejectedValue(new Error('Availability system error'))

      // Should either throw the error or handle it gracefully
      // This tests error handling in the availability creation
      await expect(fetchPageData(nextConfig, mockSearchParams)).rejects.toThrow()
    })
  })
})
