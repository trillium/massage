import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPageData } from '@/lib/slugConfigurations/helpers/fetchPageData'
import type { SlugConfigurationType } from '@/lib/types'

// Mock the fetch functions
vi.mock('@/lib/fetch/fetchContainersByQuery')
vi.mock('@/lib/fetch/fetchData')

describe('fetchPageData - blockingScope functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockSearchParams = { date: '2024-01-01' }

  describe('blockingScope: "event" (default behavior)', () => {
    it('should use fetchContainersByQuery for event-only blocking', async () => {
      const { fetchContainersByQuery } = await import('@/lib/fetch/fetchContainersByQuery')

      const config: SlugConfigurationType = {
        type: 'area-wide',
        eventContainer: 'free-30',
        blockingScope: 'event',
        bookingSlug: 'test-slug',
        title: null,
        text: null,
        location: null,
        pricing: null,
        discount: null,
        leadTimeMinimum: null,
        allowedDurations: null,
      }

      const mockContainerData = {
        start: '2024-01-01T00:00:00.000Z',
        end: '2024-01-08T00:00:00.000Z',
        busy: [
          {
            start: { dateTime: '2024-01-01T10:00:00.000Z', timeZone: 'UTC' },
            end: { dateTime: '2024-01-01T11:00:00.000Z', timeZone: 'UTC' },
          },
        ],
        containers: [],
      }

      vi.mocked(fetchContainersByQuery).mockResolvedValue(mockContainerData)

      const result = await fetchPageData(config, mockSearchParams, 'test-slug')

      expect(fetchContainersByQuery).toHaveBeenCalledWith({
        searchParams: mockSearchParams,
        query: 'free-30',
      })

      expect(result).toEqual({
        start: mockContainerData.start,
        end: mockContainerData.end,
        busy: [{ start: '2024-01-01T10:00:00.000Z', end: '2024-01-01T11:00:00.000Z' }],
        containers: mockContainerData.containers,
        nextEventFound: false,
      })
    })

    it('should default to event blocking when blockingScope is undefined', async () => {
      const { fetchContainersByQuery } = await import('@/lib/fetch/fetchContainersByQuery')

      const config: SlugConfigurationType = {
        type: 'area-wide',
        eventContainer: 'free-30',
        // blockingScope is undefined - should default to 'event' behavior
        bookingSlug: 'test-slug',
        title: null,
        text: null,
        location: null,
        pricing: null,
        discount: null,
        leadTimeMinimum: null,
        allowedDurations: null,
      }

      const mockContainerData = {
        start: '2024-01-01T00:00:00.000Z',
        end: '2024-01-08T00:00:00.000Z',
        busy: [],
        containers: [],
      }

      vi.mocked(fetchContainersByQuery).mockResolvedValue(mockContainerData)

      await fetchPageData(config, mockSearchParams, 'test-slug')

      expect(fetchContainersByQuery).toHaveBeenCalledWith({
        searchParams: mockSearchParams,
        query: 'free-30',
      })
    })
  })

  describe('blockingScope: "general"', () => {
    it('should use fetchAllCalendarEvents and general blocking filters', async () => {
      const { fetchAllCalendarEvents, filterEventsForGeneralBlocking, filterEventsForQuery } =
        await import('@/lib/fetch/fetchContainersByQuery')

      const config: SlugConfigurationType = {
        type: 'area-wide',
        eventContainer: 'free-30',
        blockingScope: 'general',
        bookingSlug: 'test-slug',
        title: null,
        text: null,
        location: null,
        pricing: null,
        discount: null,
        leadTimeMinimum: null,
        allowedDurations: null,
      }

      const mockAllEventsData = {
        start: '2024-01-01T00:00:00.000Z',
        end: '2024-01-08T00:00:00.000Z',
        allEvents: [], // Simplified - we'll test the filter functions separately
      }

      const mockGeneralBlocking = {
        events: [],
        members: [],
        regularEvents: [],
        blockingEvents: [],
        busyQuery: [
          {
            start: { dateTime: '2024-01-01T14:00:00.000Z', timeZone: 'UTC' },
            end: { dateTime: '2024-01-01T15:00:00.000Z', timeZone: 'UTC' },
          },
          {
            start: { dateTime: '2024-01-01T16:00:00.000Z', timeZone: 'UTC' },
            end: { dateTime: '2024-01-01T17:00:00.000Z', timeZone: 'UTC' },
          },
        ],
      }

      const mockQuerySpecific = {
        events: [],
        containers: [],
        members: [],
        busyQuery: [],
        searchQuery: 'free-30__EVENT__',
        eventMemberString: 'free-30__EVENT__MEMBER__',
        eventContainerString: 'free-30__EVENT__CONTAINER__',
      }

      vi.mocked(fetchAllCalendarEvents).mockResolvedValue(mockAllEventsData)
      vi.mocked(filterEventsForGeneralBlocking).mockReturnValue(mockGeneralBlocking)
      vi.mocked(filterEventsForQuery).mockReturnValue(mockQuerySpecific)

      const result = await fetchPageData(config, mockSearchParams, 'test-slug')

      expect(fetchAllCalendarEvents).toHaveBeenCalledWith({
        searchParams: mockSearchParams,
      })
      expect(filterEventsForGeneralBlocking).toHaveBeenCalledWith([])
      expect(filterEventsForQuery).toHaveBeenCalledWith([], 'free-30')

      // Should use general blocking busy query (blocks everything)
      expect(result.busy).toHaveLength(2)
      expect(result.busy).toEqual([
        { start: '2024-01-01T14:00:00.000Z', end: '2024-01-01T15:00:00.000Z' },
        { start: '2024-01-01T16:00:00.000Z', end: '2024-01-01T17:00:00.000Z' },
      ])
    })
  })

  describe('scheduled-site type with blockingScope', () => {
    it('should use slug as query when eventContainer is not specified', async () => {
      const { fetchContainersByQuery } = await import('@/lib/fetch/fetchContainersByQuery')

      const config: SlugConfigurationType = {
        type: 'scheduled-site',
        eventContainer: null,
        blockingScope: 'event',
        bookingSlug: 'special-event',
        title: null,
        text: null,
        location: null,
        pricing: null,
        discount: null,
        leadTimeMinimum: null,
        allowedDurations: null,
      }

      const mockContainerData = {
        start: '2024-01-01T00:00:00.000Z',
        end: '2024-01-08T00:00:00.000Z',
        busy: [],
        containers: [],
      }

      vi.mocked(fetchContainersByQuery).mockResolvedValue(mockContainerData)

      await fetchPageData(config, mockSearchParams, 'special-event')

      expect(fetchContainersByQuery).toHaveBeenCalledWith({
        searchParams: mockSearchParams,
        query: 'special-event', // Should use slug as query
      })
    })
  })
})
