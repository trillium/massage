import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPageData } from '../helpers/fetchPageData'
import { fetchSlugConfigurationData } from '../fetchSlugConfigurationData'
import { GoogleCalendarV3Event } from '@/lib/types'

describe('Event Container Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use eventContainer property for area-wide configurations', async () => {
    // Mock the container fetching with proper GoogleCalendarV3Event structure
    const mockFetchContainers = vi.fn(async ({ query }) => ({
      start: '2025-08-08',
      end: '2025-08-29',
      busy: [],
      containers: [
        {
          id: 'test-container',
          summary: `${query}__EVENT__CONTAINER__`,
          description: 'Test container event',
          start: { dateTime: '2025-08-10T10:00:00Z', timeZone: 'UTC' },
          end: { dateTime: '2025-08-10T12:00:00Z', timeZone: 'UTC' },
          location: 'Test Location',
          attendees: [],
          kind: 'calendar#event',
          etag: 'test-etag',
          status: 'confirmed',
          htmlLink: 'https://calendar.google.com/event?eid=test',
          created: '2025-08-07T00:00:00Z',
          updated: '2025-08-07T00:00:00Z',
          creator: {},
          organizer: {},
          recurringEventId: '',
          originalStartTime: {},
          iCalUID: 'test-uid',
          sequence: 0,
          reminders: {},
          eventType: 'default',
        } as GoogleCalendarV3Event,
      ],
    }))

    vi.spyOn(
      await import('@/lib/fetch/fetchContainersByQuery'),
      'fetchContainersByQuery'
    ).mockImplementation(mockFetchContainers)

    // Get the configuration data
    const configData = await fetchSlugConfigurationData()
    const free30Config = configData['free-30']

    // Verify the configuration has eventContainer set
    expect(free30Config?.eventContainer).toBe('free-30')
    expect(free30Config?.type).toBe('area-wide')

    // Fetch page data for free-30 configuration
    const data = await fetchPageData(free30Config, {}, 'free-30')

    // Should have called fetchContainersByQuery with the eventContainer value
    expect(mockFetchContainers).toHaveBeenCalledWith({
      searchParams: {},
      query: 'free-30',
    })

    // Should return container data
    expect(data.containers).toBeDefined()
    expect(data.containers).toHaveLength(1)
    expect(data.containers?.[0].summary).toBe('free-30__EVENT__CONTAINER__')
  })

  it('should fall back to regular data for configurations without eventContainer', async () => {
    // Mock regular data fetching
    const mockFetchData = vi.fn(async () => ({
      start: '2025-08-08',
      end: '2025-08-22',
      busy: [],
    }))

    vi.spyOn(await import('@/lib/fetch/fetchData'), 'fetchData').mockImplementation(mockFetchData)

    const configData = await fetchSlugConfigurationData()
    const regularConfig = configData['foo'] // This doesn't have eventContainer

    const data = await fetchPageData(regularConfig, {}, 'foo')

    // Should not have containers property for regular area-wide configs without eventContainer
    expect(data.containers).toBeUndefined()
    expect(mockFetchData).toHaveBeenCalledWith({ searchParams: {} })
  })
})
