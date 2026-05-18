import { describe, it, expect, vi, afterEach, Mock } from 'vitest'
import { fetchPageData } from '../fetchPageData'
import { SlugConfigurationType } from '@/lib/types'
import { addDays, format } from 'date-fns'

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
  LEAD_TIME: 180,
  OWNER_TIMEZONE: 'America/Los_Angeles',
}))

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

function futureDateStr(daysFromNow: number): string {
  return format(addDays(new Date(), daysFromNow), 'yyyy-MM-dd')
}

describe('windowDaysFromPromo (tested indirectly via fetchPageData)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('no promoEndDate passes undefined windowDays to fetchData', async () => {
    const config = makeConfig({ type: 'area-wide' })
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-29',
      busy: [],
    })

    await fetchPageData(config, {})

    expect(fetchData).toHaveBeenCalledWith({
      searchParams: {},
      windowDays: undefined,
    })
  })

  it('promoEndDate <= 14 days away passes undefined windowDays', async () => {
    const config = makeConfig({
      type: 'area-wide',
      promoEndDate: futureDateStr(10),
    })
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-29',
      busy: [],
    })

    await fetchPageData(config, {})

    expect(fetchData).toHaveBeenCalledWith({
      searchParams: {},
      windowDays: undefined,
    })
  })

  it('promoEndDate exactly 14 days away passes undefined windowDays', async () => {
    const config = makeConfig({
      type: 'area-wide',
      promoEndDate: futureDateStr(13),
    })
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-29',
      busy: [],
    })

    await fetchPageData(config, {})

    expect(fetchData).toHaveBeenCalledWith({
      searchParams: {},
      windowDays: undefined,
    })
  })

  it('promoEndDate 30 days out passes ~30 as windowDays', async () => {
    const config = makeConfig({
      type: 'area-wide',
      promoEndDate: futureDateStr(30),
    })
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-02-14',
      busy: [],
    })

    await fetchPageData(config, {})

    const call = (fetchData as Mock).mock.calls[0][0]
    expect(call.windowDays).toBeGreaterThanOrEqual(30)
    expect(call.windowDays).toBeLessThanOrEqual(32)
  })

  it('promoEndDate 60 days out passes ~60 as windowDays', async () => {
    const config = makeConfig({
      type: 'area-wide',
      promoEndDate: futureDateStr(60),
    })
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-03-16',
      busy: [],
    })

    await fetchPageData(config, {})

    const call = (fetchData as Mock).mock.calls[0][0]
    expect(call.windowDays).toBeGreaterThanOrEqual(60)
    expect(call.windowDays).toBeLessThanOrEqual(62)
  })

  it('promoEndDate in the past passes undefined windowDays', async () => {
    const config = makeConfig({
      type: 'area-wide',
      promoEndDate: format(addDays(new Date(), -5), 'yyyy-MM-dd'),
    })
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-29',
      busy: [],
    })

    await fetchPageData(config, {})

    expect(fetchData).toHaveBeenCalledWith({
      searchParams: {},
      windowDays: undefined,
    })
  })
})

describe('promo window integration: config type routes pass windowDays correctly', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fixed-location with promo 30 days out extends the fetch window', async () => {
    const config = makeConfig({
      type: 'fixed-location',
      promoEndDate: futureDateStr(30),
    })
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-02-14',
      busy: [],
    })

    const result = await fetchPageData(config, {}, undefined, undefined, undefined, undefined, true)

    expect(result.debugInfo?.pathTaken).toBe('fixed-location')
    const call = (fetchData as Mock).mock.calls[0][0]
    expect(call.windowDays).toBeGreaterThanOrEqual(30)
    expect(call.windowDays).toBeLessThanOrEqual(32)
  })

  it('area-wide with promo 30 days out extends the fetch window', async () => {
    const config = makeConfig({
      type: 'area-wide',
      promoEndDate: futureDateStr(30),
    })
    const { fetchData } = await import('@/lib/fetch/fetchData')
    ;(fetchData as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-02-14',
      busy: [],
    })

    const result = await fetchPageData(config, {}, undefined, undefined, undefined, undefined, true)

    expect(result.debugInfo?.pathTaken).toBe('area-wide')
    const call = (fetchData as Mock).mock.calls[0][0]
    expect(call.windowDays).toBeGreaterThanOrEqual(30)
    expect(call.windowDays).toBeLessThanOrEqual(32)
  })

  it('container path ignores promoEndDate entirely', async () => {
    const config = makeConfig({
      type: 'scheduled-site',
      promoEndDate: futureDateStr(30),
    })
    const { fetchAllCalendarEvents, filterEventsForQuery } = await import(
      '@/lib/fetch/fetchContainersByQuery'
    )
    ;(fetchAllCalendarEvents as Mock).mockResolvedValue({
      start: '2025-01-15',
      end: '2025-01-28',
      allEvents: [],
    })
    ;(filterEventsForQuery as Mock).mockReturnValue({
      events: [],
      containers: [],
      members: [],
      busyQuery: [],
      searchQuery: 'test__EVENT__',
      eventMemberString: 'test__EVENT__MEMBER__',
      eventContainerString: 'test__EVENT__CONTAINER__',
    })

    const { fetchData } = await import('@/lib/fetch/fetchData')

    const result = await fetchPageData(config, {}, 'test', undefined, undefined, undefined, true)

    expect(result.debugInfo?.pathTaken).toBe('container-event')
    expect(fetchData).not.toHaveBeenCalled()
  })
})
