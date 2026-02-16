import { GoogleCalendarV3Event, SearchParamsType, SlugConfigurationType } from '@/lib/types'
import {
  fetchContainersByQuery,
  fetchAllCalendarEvents,
  filterEventsForQuery,
  filterEventsForGeneralBlocking,
} from '@/lib/fetch/fetchContainersByQuery'
import { fetchData } from '@/lib/fetch/fetchData'
import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import { getNextUpcomingEvent } from '@/lib/fetch/getNextUpcomingEvent'
import { MockedData, FetchPageDataReturnType } from './fetchPageData.types'

type PageDataResult = Omit<FetchPageDataReturnType, 'debugInfo'>

export { fetchNextWithEventResult, fetchNextNoEventFallback } from './fetchPageData.handlers.next'
export {
  fetchAdjacentWithEventResult,
  fetchAdjacentNoEventFallback,
} from './fetchPageData.handlers.adjacent'

export async function resolveCurrentEvent(
  eventId?: string,
  currentEvent?: GoogleCalendarV3Event
): Promise<GoogleCalendarV3Event | null> {
  if (currentEvent) return currentEvent
  if (eventId && typeof eventId === 'string') {
    const fetched = await fetchSingleEvent(eventId)
    if (!fetched) throw new Error(`Event not found: ${eventId}`)
    return fetched
  }
  return getNextUpcomingEvent()
}

export function buildInvalidSlugResult(): PageDataResult {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  return { start: todayStr, end: yesterdayStr, busy: [], nextEventFound: false }
}

export function buildMockedResult(mocked: MockedData): PageDataResult {
  return {
    start: mocked.start,
    end: mocked.end,
    busy: mocked.busy.map((b) => ({
      start: b.start.toISOString(),
      end: b.end.toISOString(),
    })),
    timeZone: mocked.timeZone,
    data: mocked.data || {},
    containers: [],
    nextEventFound: false,
  }
}

export async function fetchContainerResult(
  configuration: SlugConfigurationType,
  resolvedParams: SearchParamsType,
  bookingSlug?: string
): Promise<{ result: PageDataResult; pathTaken: string }> {
  const query = configuration?.eventContainer || bookingSlug!
  const blockingScope = configuration?.blockingScope || 'event'

  let containerData

  if (blockingScope === 'general') {
    const allEventsData = await fetchAllCalendarEvents({ searchParams: resolvedParams })
    const generalBlocking = filterEventsForGeneralBlocking(allEventsData.allEvents)
    const querySpecific = filterEventsForQuery(allEventsData.allEvents, query)
    containerData = {
      start: allEventsData.start,
      end: allEventsData.end,
      busy: generalBlocking.busyQuery,
      containers: querySpecific.containers,
    }
  } else {
    containerData = await fetchContainersByQuery({ searchParams: resolvedParams, query })
  }

  const busyConverted = containerData.busy.map((busyItem) => ({
    start: typeof busyItem.start === 'string' ? busyItem.start : busyItem.start.dateTime,
    end: typeof busyItem.end === 'string' ? busyItem.end : busyItem.end.dateTime,
  }))

  return {
    result: {
      start: containerData.start,
      end: containerData.end,
      busy: busyConverted,
      containers: containerData.containers,
      nextEventFound: false,
    },
    pathTaken: blockingScope === 'general' ? 'container-general' : 'container-event',
  }
}

export async function fetchFixedLocationResult(
  resolvedParams: SearchParamsType
): Promise<PageDataResult> {
  const regularData = await fetchData({ searchParams: resolvedParams })
  return {
    start: regularData.start,
    end: regularData.end,
    busy: regularData.busy,
    nextEventFound: false,
  }
}

export async function fetchAreaWideResult(
  resolvedParams: SearchParamsType
): Promise<PageDataResult> {
  const regularData = await fetchData({ searchParams: resolvedParams })
  return {
    start: regularData.start,
    end: regularData.end,
    busy: regularData.busy,
    nextEventFound: false,
  }
}

export async function maybeCaptureTestData(
  result: FetchPageDataReturnType,
  configuration: SlugConfigurationType,
  resolvedParams: SearchParamsType,
  bookingSlug?: string,
  eventId?: string
): Promise<void> {
  if (typeof window === 'undefined' && process.env.CAPTURE_TEST_DATA === 'true') {
    try {
      const { captureFetchPageData } = await import('@/lib/utils/captureTestData')
      await captureFetchPageData({
        configuration: configuration as Record<string, unknown>,
        resolvedParams: resolvedParams as Record<string, unknown>,
        bookingSlug,
        eventId,
        result,
      })
    } catch (error) {
      console.error('Failed to capture test data:', error)
    }
  }
}
