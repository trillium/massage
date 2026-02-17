import { GoogleCalendarV3Event, SearchParamsType, SlugConfigurationType } from '@/lib/types'
import { MockedData, FetchPageDataReturnType } from './fetchPageData.types'
import {
  resolveCurrentEvent,
  buildInvalidSlugResult,
  buildMockedResult,
  fetchContainerResult,
  fetchFixedLocationResult,
  fetchNextWithEventResult,
  fetchNextNoEventFallback,
  fetchAdjacentWithEventResult,
  fetchAdjacentNoEventFallback,
  fetchAreaWideResult,
  maybeCaptureTestData,
} from './fetchPageData.handlers'

type DebugInfo = NonNullable<FetchPageDataReturnType['debugInfo']>

function wrapWithDebug(
  result: Omit<FetchPageDataReturnType, 'debugInfo'>,
  pathTaken: string,
  debugInfo?: DebugInfo
): FetchPageDataReturnType {
  if (debugInfo) {
    debugInfo.pathTaken = pathTaken
    debugInfo.outputs = result
  }
  return { ...result, debugInfo }
}

function isContainerBasedPath(configuration: SlugConfigurationType, bookingSlug?: string): boolean {
  return (
    (configuration?.type === 'scheduled-site' && !!bookingSlug) || !!configuration?.eventContainer
  )
}

export async function fetchPageData(
  configuration: SlugConfigurationType,
  resolvedParams: SearchParamsType,
  bookingSlug?: string,
  mocked?: MockedData | null,
  eventId?: string,
  currentEvent?: GoogleCalendarV3Event,
  debug?: boolean
): Promise<FetchPageDataReturnType> {
  const debugInfo = debug
    ? {
        pathTaken: '',
        inputs: { configuration, resolvedParams, bookingSlug, mocked, eventId, currentEvent },
        outputs: {},
      }
    : undefined

  if (configuration?.type === null) {
    return wrapWithDebug(buildInvalidSlugResult(), 'invalid-slug', debugInfo)
  }

  if (mocked) {
    return wrapWithDebug(buildMockedResult(mocked), 'mocked', debugInfo)
  }

  if (isContainerBasedPath(configuration, bookingSlug)) {
    const { result, pathTaken } = await fetchContainerResult(
      configuration,
      resolvedParams,
      bookingSlug
    )
    return wrapWithDebug(result, pathTaken, debugInfo)
  }

  if (configuration?.type === 'fixed-location') {
    return wrapWithDebug(
      await fetchFixedLocationResult(resolvedParams),
      'fixed-location',
      debugInfo
    )
  }

  if (configuration?.type === 'next') {
    const event = await resolveCurrentEvent(eventId, currentEvent)
    if (event) {
      return wrapWithDebug(await fetchNextWithEventResult(event), 'next-with-event', debugInfo)
    }
    return wrapWithDebug(await fetchNextNoEventFallback(resolvedParams), 'next-no-event', debugInfo)
  }

  if (configuration?.type === 'adjacent') {
    const event = await resolveCurrentEvent(eventId, currentEvent)
    if (event) {
      return wrapWithDebug(
        await fetchAdjacentWithEventResult(event),
        'adjacent-with-event',
        debugInfo
      )
    }
    return wrapWithDebug(
      await fetchAdjacentNoEventFallback(resolvedParams),
      'adjacent-no-event',
      debugInfo
    )
  }

  const finalResult = wrapWithDebug(
    await fetchAreaWideResult(resolvedParams),
    'area-wide',
    debugInfo
  )
  await maybeCaptureTestData(finalResult, configuration, resolvedParams, bookingSlug, eventId)
  return finalResult
}
