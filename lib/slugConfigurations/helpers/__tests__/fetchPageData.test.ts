import { describe, it, expect, vi, afterEach, Mock } from 'vitest'
import { fetchPageData } from '../fetchPageData'
import { SlugConfigurationType, GoogleCalendarV3Event } from '@/lib/types'

vi.mock('@/lib/fetch/fetchData', () => ({
  fetchData: vi.fn(),
}))

vi.mock('@/lib/fetch/fetchContainersByQuery', () => ({
  fetchContainersByQuery: vi.fn(),
  fetchContainerGeneric: vi.fn(),
  fetchAllCalendarEvents: vi.fn(),
  filterEventsForQuery: vi.fn(),
  filterEventsForGeneralBlocking: vi.fn(),
}))

vi.mock('@/lib/fetch/fetchSingleEvent', () => ({
  fetchSingleEvent: vi.fn(),
}))

vi.mock('@/lib/fetch/getNextUpcomingEvent', () => ({
  getNextUpcomingEvent: vi.fn(),
}))

vi.mock('@/lib/availability/getNextSlotAvailability', () => ({
  createMultiDurationAvailability: vi.fn(),
}))

vi.mock('@/lib/availability/getAdjacentSlotAvailability', () => ({
  createMultiDurationAvailability: vi.fn(),
}))

vi.mock('@/lib/geocode', () => ({
  geocodeLocation: vi.fn(),
}))

vi.mock('config', () => ({
  ALLOWED_DURATIONS: [60, 90, 120],
}))

const mockEvent: Partial<GoogleCalendarV3Event> = {
  id: 'test-event-1',
  summary: 'Test Massage',
  start: { dateTime: '2025-01-15T14:00:00-08:00' },
  end: { dateTime: '2025-01-15T15:00:00-08:00' },
  location: '123 Test St, Portland OR',
}

const baseConfig: Partial<SlugConfigurationType> = {
  bookingSlug: null,
  title: null,
  text: null,
  location: null,
  eventContainer: null,
  pricing: null,
  discount: null,
  leadTimeMinimum: null,
  allowedDurations: null,
}

function makeConfig(overrides: Partial<SlugConfigurationType>): SlugConfigurationType {
  return { ...baseConfig, ...overrides } as SlugConfigurationType
}

describe('fetchPageData', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('null config returns invalid-slug path', async () => {
    const config = makeConfig({ type: null })
    const result = await fetchPageData(config, {}, undefined, undefined, undefined, undefined, true)
    expect(result.debugInfo?.pathTaken).toBe('invalid-slug')
    expect(result.nextEventFound).toBe(false)
    expect(result.busy).toEqual([])
    const { fetchData } = await import('@/lib/fetch/fetchData')
    expect(fetchData).not.toHaveBeenCalled()
  })

  it('mocked data returns mocked path with ISO busy strings', async () => {
    const config = makeConfig({ type: 'area-wide' })
    const mockedData = {
      start: '2025-01-15',
      end: '2025-01-17',
      busy: [{ start: new Date('2025-01-15T10:00:00Z'), end: new Date('2025-01-15T11:00:00Z') }],
    }
    const result = await fetchPageData(
      config,
      {},
      undefined,
      mockedData,
      undefined,
      undefined,
      true
    )
    expect(result.debugInfo?.pathTaken).toBe('mocked')
    expect(result.busy[0].start).toBe(new Date('2025-01-15T10:00:00Z').toISOString())
    expect(result.busy[0].end).toBe(new Date('2025-01-15T11:00:00Z').toISOString())
    expect(result.nextEventFound).toBe(false)
    const { fetchData } = await import('@/lib/fetch/fetchData')
    expect(fetchData).not.toHaveBeenCalled()
  })

  it('scheduled-site returns container-event path', async () => {
    const config = makeConfig({ type: 'scheduled-site' })
    const { fetchContainersByQuery } = await import('@/lib/fetch/fetchContainersByQuery')
    ;(fetchContainersByQuery as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-28',
      busy: [{ start: '2025-01-16T10:00:00Z', end: '2025-01-16T11:00:00Z' }],
      containers: [{ id: 'container-1', summary: 'test-slug__EVENT__CONTAINER__' }],
    })
    const result = await fetchPageData(
      config,
      {},
      'test-slug',
      undefined,
      undefined,
      undefined,
      true
    )
    expect(result.debugInfo?.pathTaken).toBe('container-event')
    expect(fetchContainersByQuery).toHaveBeenCalled()
    expect(result.containers).toBeDefined()
  })

  it('scheduled-site with general blockingScope returns container-general path', async () => {
    const config = makeConfig({ type: 'scheduled-site', blockingScope: 'general' })
    const { fetchAllCalendarEvents, filterEventsForGeneralBlocking, filterEventsForQuery } =
      await import('@/lib/fetch/fetchContainersByQuery')
    ;(fetchAllCalendarEvents as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-02-05',
      allEvents: [
        {
          id: 'ev-1',
          summary: 'test-slug__EVENT__MEMBER__',
          start: { dateTime: '2025-01-16T10:00:00Z' },
          end: { dateTime: '2025-01-16T11:00:00Z' },
        },
      ],
    })
    ;(filterEventsForGeneralBlocking as Mock).mockReturnValue({
      busyQuery: [
        {
          start: { dateTime: '2025-01-16T10:00:00Z' },
          end: { dateTime: '2025-01-16T11:00:00Z' },
        },
      ],
    })
    ;(filterEventsForQuery as Mock).mockReturnValue({
      containers: [{ id: 'c-1', summary: 'test-slug__EVENT__CONTAINER__' }],
    })
    const result = await fetchPageData(
      config,
      {},
      'test-slug',
      undefined,
      undefined,
      undefined,
      true
    )
    expect(result.debugInfo?.pathTaken).toBe('container-general')
    expect(fetchAllCalendarEvents).toHaveBeenCalled()
    expect(result.containers).toBeDefined()
  })

  it('eventContainer override triggers container path regardless of type', async () => {
    const config = makeConfig({ type: 'area-wide', eventContainer: '__TEST_QUERY__' })
    const { fetchContainersByQuery } = await import('@/lib/fetch/fetchContainersByQuery')
    ;(fetchContainersByQuery as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-28',
      busy: [],
      containers: [{ id: 'c-1', summary: '__TEST_QUERY____EVENT__CONTAINER__' }],
    })
    const result = await fetchPageData(config, {}, undefined, undefined, undefined, undefined, true)
    expect(result.debugInfo?.pathTaken).toBe('container-event')
    expect(fetchContainersByQuery).toHaveBeenCalled()
  })

  it('fixed-location returns fixed-location path without containers', async () => {
    const config = makeConfig({ type: 'fixed-location' })
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-29',
      busy: [{ start: '2025-01-16T09:00:00Z', end: '2025-01-16T10:00:00Z' }],
    })
    const result = await fetchPageData(config, {}, undefined, undefined, undefined, undefined, true)
    expect(result.debugInfo?.pathTaken).toBe('fixed-location')
    expect(fetchData).toHaveBeenCalled()
    expect(result.containers).toBeUndefined()
    expect(result.nextEventFound).toBe(false)
  })

  it('next type with currentEvent returns next-with-event path', async () => {
    const config = makeConfig({ type: 'next' })
    const { createMultiDurationAvailability } = await import(
      '@/lib/availability/getNextSlotAvailability'
    )
    const mockGetTimeList = vi.fn().mockReturnValue([
      {
        start: '2025-01-15T15:00:00-08:00',
        end: '2025-01-15T16:00:00-08:00',
        location: { street: '123 Test St', city: 'Portland OR', zip: '90210' },
      },
    ])
    ;(createMultiDurationAvailability as Mock).mockResolvedValue({
      getTimeListFormatForDuration: mockGetTimeList,
    })
    const { geocodeLocation } = await import('@/lib/geocode')
    ;(geocodeLocation as Mock).mockResolvedValue({
      success: true,
      coordinates: { lat: 45.5155, lng: -122.6789 },
    })
    const result = await fetchPageData(
      config,
      {},
      undefined,
      undefined,
      undefined,
      mockEvent as GoogleCalendarV3Event,
      true
    )
    expect(result.debugInfo?.pathTaken).toBe('next-with-event')
    expect(result.nextEventFound).toBe(true)
    expect(result.multiDurationSlots).toBeDefined()
    expect(result.eventCoordinates).toEqual({ latitude: 45.5155, longitude: -122.6789 })
  })

  it('next type without event returns next-no-event path', async () => {
    const config = makeConfig({ type: 'next' })
    const { getNextUpcomingEvent } = await import('@/lib/fetch/getNextUpcomingEvent')
    ;(getNextUpcomingEvent as Mock).mockResolvedValue(null)
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-17',
      busy: [{ start: '2025-01-15T18:00:00Z', end: '2025-01-15T19:00:00Z' }],
    })
    const result = await fetchPageData(config, {}, undefined, undefined, undefined, undefined, true)
    expect(result.debugInfo?.pathTaken).toBe('next-no-event')
    expect(result.nextEventFound).toBe(false)
    expect(result.targetDate).toBeDefined()
  })

  it('adjacent type with currentEvent returns adjacent-with-event path', async () => {
    const config = makeConfig({ type: 'adjacent' })
    const { createMultiDurationAvailability } = await import(
      '@/lib/availability/getAdjacentSlotAvailability'
    )
    const mockGetTimeList = vi.fn().mockReturnValue([
      {
        start: '2025-01-15T13:00:00-08:00',
        end: '2025-01-15T14:00:00-08:00',
        location: { street: '123 Test St', city: 'Portland OR', zip: '90210' },
      },
    ])
    ;(createMultiDurationAvailability as Mock).mockResolvedValue({
      getTimeListFormatForDuration: mockGetTimeList,
    })
    const result = await fetchPageData(
      config,
      {},
      undefined,
      undefined,
      undefined,
      mockEvent as GoogleCalendarV3Event,
      true
    )
    expect(result.debugInfo?.pathTaken).toBe('adjacent-with-event')
    expect(result.nextEventFound).toBe(true)
    expect(result.multiDurationSlots).toBeDefined()
  })

  it('adjacent type without event returns adjacent-no-event path', async () => {
    const config = makeConfig({ type: 'adjacent' })
    const { getNextUpcomingEvent } = await import('@/lib/fetch/getNextUpcomingEvent')
    ;(getNextUpcomingEvent as Mock).mockResolvedValue(null)
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-17',
      busy: [{ start: '2025-01-15T14:00:00Z', end: '2025-01-15T15:00:00Z' }],
    })
    const result = await fetchPageData(config, {}, undefined, undefined, undefined, undefined, true)
    expect(result.debugInfo?.pathTaken).toBe('adjacent-no-event')
    expect(result.nextEventFound).toBe(false)
    expect(result.busy).toEqual([{ start: '2025-01-15T14:00:00Z', end: '2025-01-15T15:00:00Z' }])
    expect(result.multiDurationSlots).toBeUndefined()
    expect(result.currentEvent).toBeUndefined()
  })

  it('next type with all-day event (no dateTime) falls back to current time', async () => {
    const config = makeConfig({ type: 'next' })
    const allDayEvent: Partial<GoogleCalendarV3Event> = {
      id: 'all-day-event',
      summary: 'All Day Event',
      start: { date: '2025-01-15' },
      end: { date: '2025-01-16' },
    }
    const { createMultiDurationAvailability } = await import(
      '@/lib/availability/getNextSlotAvailability'
    )
    const mockGetTimeList = vi.fn().mockReturnValue([])
    ;(createMultiDurationAvailability as Mock).mockResolvedValue({
      getTimeListFormatForDuration: mockGetTimeList,
    })
    const result = await fetchPageData(
      config,
      {},
      undefined,
      undefined,
      undefined,
      allDayEvent as GoogleCalendarV3Event,
      true
    )
    expect(result.debugInfo?.pathTaken).toBe('next-with-event')
    expect(result.nextEventFound).toBe(true)
    expect(result.start).toBeDefined()
    expect(result.end).toBeDefined()
  })

  it('adjacent type with all-day event (no dateTime) falls back to current time', async () => {
    const config = makeConfig({ type: 'adjacent' })
    const allDayEvent: Partial<GoogleCalendarV3Event> = {
      id: 'all-day-event',
      summary: 'All Day Event',
      start: { date: '2025-01-15' },
      end: { date: '2025-01-16' },
    }
    const { createMultiDurationAvailability } = await import(
      '@/lib/availability/getAdjacentSlotAvailability'
    )
    const mockGetTimeList = vi.fn().mockReturnValue([])
    ;(createMultiDurationAvailability as Mock).mockResolvedValue({
      getTimeListFormatForDuration: mockGetTimeList,
    })
    const result = await fetchPageData(
      config,
      {},
      undefined,
      undefined,
      undefined,
      allDayEvent as GoogleCalendarV3Event,
      true
    )
    expect(result.debugInfo?.pathTaken).toBe('adjacent-with-event')
    expect(result.nextEventFound).toBe(true)
    expect(result.start).toBeDefined()
    expect(result.end).toBeDefined()
  })

  it('next type with event without location skips geocoding', async () => {
    const config = makeConfig({ type: 'next' })
    const noLocationEvent: Partial<GoogleCalendarV3Event> = {
      id: 'no-location-event',
      summary: 'No Location',
      start: { dateTime: '2025-01-15T14:00:00-08:00' },
      end: { dateTime: '2025-01-15T15:00:00-08:00' },
    }
    const { createMultiDurationAvailability } = await import(
      '@/lib/availability/getNextSlotAvailability'
    )
    const mockGetTimeList = vi.fn().mockReturnValue([])
    ;(createMultiDurationAvailability as Mock).mockResolvedValue({
      getTimeListFormatForDuration: mockGetTimeList,
    })
    const { geocodeLocation } = await import('@/lib/geocode')
    const result = await fetchPageData(
      config,
      {},
      undefined,
      undefined,
      undefined,
      noLocationEvent as GoogleCalendarV3Event,
      true
    )
    expect(result.debugInfo?.pathTaken).toBe('next-with-event')
    expect(geocodeLocation).not.toHaveBeenCalled()
    expect(result.eventCoordinates).toBeUndefined()
  })

  it('next type with geocoding failure still returns result', async () => {
    const config = makeConfig({ type: 'next' })
    const { createMultiDurationAvailability } = await import(
      '@/lib/availability/getNextSlotAvailability'
    )
    const mockGetTimeList = vi.fn().mockReturnValue([])
    ;(createMultiDurationAvailability as Mock).mockResolvedValue({
      getTimeListFormatForDuration: mockGetTimeList,
    })
    const { geocodeLocation } = await import('@/lib/geocode')
    ;(geocodeLocation as Mock).mockRejectedValue(new Error('Geocoding API down'))
    const result = await fetchPageData(
      config,
      {},
      undefined,
      undefined,
      undefined,
      mockEvent as GoogleCalendarV3Event,
      true
    )
    expect(result.debugInfo?.pathTaken).toBe('next-with-event')
    expect(result.nextEventFound).toBe(true)
    expect(result.eventCoordinates).toBeUndefined()
  })

  it('area-wide type returns area-wide path', async () => {
    const config = makeConfig({ type: 'area-wide' })
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-29',
      busy: [{ start: '2025-01-16T14:00:00Z', end: '2025-01-16T15:00:00Z' }],
    })
    const result = await fetchPageData(config, {}, undefined, undefined, undefined, undefined, true)
    expect(result.debugInfo?.pathTaken).toBe('area-wide')
    expect(fetchData).toHaveBeenCalled()
    expect(result.nextEventFound).toBe(false)
  })
})
