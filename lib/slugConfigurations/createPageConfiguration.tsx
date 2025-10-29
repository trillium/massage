import { createSlots } from '@/lib/availability/createSlots'
import { ALLOWED_DURATIONS, LEAD_TIME } from 'config'
import { dayFromString } from '@/lib/dayAsObject'
import {
  GoogleCalendarV3Event,
  SearchParamsType,
  SlugConfigurationType,
  StringDateTimeIntervalAndLocation,
  DayWithStartEnd,
} from '@/lib/types'
import { validateSearchParams } from '@/lib/searchParams/validateSearchParams'
import { isPromoExpired } from '@/lib/utilities/promoValidation'
import { resolveConfiguration } from './helpers/resolveConfiguration'
import { fetchPageData } from './helpers/fetchPageData'
import { calculateEndDate } from './helpers/calculateEndDate'
import { generateContainerStrings } from './helpers/generateContainerStrings'
import { buildDurationProps } from './helpers/buildDurationProps'
import { getNullPageConfiguration } from './helpers/getNullPageConfiguration'

import type {
  createPageConfigurationProps,
  PageConfigurationReturnType,
  DebugInfoType,
} from '@/lib/componentTypes'

export async function createPageConfiguration({
  bookingSlug,
  resolvedParams,
  overrides,
  eventId,
  currentEvent,
  mocked,
  debug,
}: createPageConfigurationProps): Promise<PageConfigurationReturnType> {
  const debugInfo: DebugInfoType | undefined = debug
    ? {
        executionPath: 'createPageConfiguration',
        inputs: {
          bookingSlug: bookingSlug || '',
          resolvedParams,
          overrides,
        },
        intermediateResults: {},
        outputs: {},
      }
    : undefined

  // 1. Resolve configuration
  const { configuration, debugInfo: resolveDebug } = await resolveConfiguration(
    bookingSlug,
    overrides,
    debug
  )
  if (debugInfo && resolveDebug) {
    debugInfo.executionPath += '.resolveConfiguration'
    debugInfo.intermediateResults.resolveConfiguration = resolveDebug
  }

  // If configuration type is null, this is an invalid slug
  if (configuration?.type === null) {
    // exit the function without running any fetch queries
    const nullConfig = getNullPageConfiguration()
    return {
      ...nullConfig,
      debug: debug
        ? {
            executionPath: 'invalid-slug',
            inputs: { bookingSlug: bookingSlug || '', resolvedParams, overrides },
            intermediateResults: {},
            outputs: nullConfig,
          }
        : undefined,
    }
  }

  // 2. Fetch data based on configuration and mocking requirements
  const { debugInfo: fetchDebug, ...data } = await fetchPageData(
    configuration,
    resolvedParams,
    bookingSlug,
    mocked,
    eventId,
    currentEvent,
    debug
  )
  if (debugInfo && fetchDebug) {
    debugInfo.executionPath += '.fetchPageData'
    debugInfo.intermediateResults.fetchPageData = fetchDebug
  }

  // 3. Validate search parameters
  const validateSearchParamsResult = validateSearchParams({
    searchParams: resolvedParams,
    allowedDurations: configuration?.allowedDurations ?? undefined,
  })
  const { duration, selectedDate } = validateSearchParamsResult
  if (debugInfo) {
    debugInfo.intermediateResults.validateSearchParams = {
      inputs: { searchParams: resolvedParams, allowedDurations: configuration?.allowedDurations },
      outputs: validateSearchParamsResult,
    }
  }

  // 4. Calculate date boundaries
  const start = dayFromString(data.start)
  const end = calculateEndDate(data.end, configuration)

  // 5. Calculate lead time and create slots
  const leadTime = configuration?.leadTimeMinimum ?? LEAD_TIME

  // Use multi-duration slots if available (for 'next' type), otherwise create regular slots
  let slots
  if (data.multiDurationSlots) {
    slots = data.multiDurationSlots[duration] || []
  } else {
    const createSlotsParams = {
      start,
      end,
      busy: data.busy,
      duration,
      leadTime,
      containers: data.containers,
    }
    slots = createSlots(createSlotsParams)
    if (debugInfo) {
      debugInfo.intermediateResults.createSlots = {
        inputs: createSlotsParams,
        outputs: slots,
      }
    }
  }

  if (debugInfo) {
    debugInfo.intermediateResults.calculateLeadTime = {
      inputs: { configurationLeadTime: configuration?.leadTimeMinimum, defaultLeadTime: LEAD_TIME },
      outputs: { effectiveLeadTime: leadTime },
    }
  }

  // 6. Generate container strings
  const containerStrings = generateContainerStrings(bookingSlug, configuration)

  // 7. Build duration and pricing properties
  const allowedDurations = configuration?.allowedDurations ?? ALLOWED_DURATIONS
  const durationProps = buildDurationProps(duration, configuration)

  // 8. Assemble final return object
  const returnObj: PageConfigurationReturnType = {
    isExpired: false,
    durationProps,
    configuration,
    selectedDate: selectedDate || null,
    allowedDurations,
    slots,
    containerStrings,
    duration,
    data: {
      start: data.start,
      end: data.end,
      busy: data.busy || [],
      containers: data.containers,
      multiDurationSlots: data.multiDurationSlots,
      currentEvent: data.currentEvent,
      eventCoordinates: data.eventCoordinates,
      nextEventFound: data.nextEventFound,
      targetDate: data.targetDate,
    },
    start,
    end,
    instantConfirm: configuration.instantConfirm ?? false,
    multiDurationSlots: data.multiDurationSlots,
    currentEvent: data.currentEvent,
    debug: debugInfo,
  }

  // 9. Check if promo is expired
  if (configuration && configuration.promoEndDate && isPromoExpired(configuration.promoEndDate)) {
    returnObj.isExpired = true
  }

  if (debugInfo) {
    const { debug, ...outputs } = returnObj
    debugInfo.outputs = outputs
  }

  return returnObj
}
