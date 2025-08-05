import { createSlots } from '@/lib/availability/createSlots'
import { ALLOWED_DURATIONS, LEAD_TIME } from 'config'
import { dayFromString } from '@/lib/dayAsObject'
import { GoogleCalendarV3Event, SearchParamsType, SlugConfigurationType } from '@/lib/types'
import { validateSearchParams } from '@/lib/searchParams/validateSearchParams'
import { isPromoExpired } from '../utilities/promoValidation'
import { resolveConfiguration } from './helpers/resolveConfiguration'
import { fetchPageData } from './helpers/fetchPageData'
import { calculateEndDate } from './helpers/calculateEndDate'
import { generateContainerStrings } from './helpers/generateContainerStrings'
import { buildDurationProps } from './helpers/buildDurationProps'
import { getNullPageConfiguration } from './helpers/getNullPageConfiguration'

export type createPageConfigurationProps = {
  bookingSlug?: string
  resolvedParams: SearchParamsType
  overrides?: Partial<SlugConfigurationType>
  mocked?: {
    start: string
    end: string
    busy: Array<{ start: Date; end: Date }>
    timeZone?: string
    data?: Record<string, unknown>
  } | null
}

export async function createPageConfiguration({
  bookingSlug,
  resolvedParams,
  overrides,
  mocked,
}: createPageConfigurationProps) {
  // 1. Resolve configuration
  const configuration = await resolveConfiguration(bookingSlug, overrides)

  // If configuration type is null, this is an invalid slug
  if (configuration?.type === null) {
    // exit the function without running any fetch queries
    return getNullPageConfiguration()
  }

  // 2. Fetch data based on configuration and mocking requirements
  const data = await fetchPageData(configuration, resolvedParams, bookingSlug, mocked)

  // 3. Validate search parameters
  const { duration, selectedDate } = validateSearchParams({ searchParams: resolvedParams })

  // 4. Calculate date boundaries
  const start = dayFromString(data.start)
  const end = calculateEndDate(data.end, configuration)

  // 5. Calculate lead time and create slots
  const leadTime = configuration?.leadTimeMinimum ?? LEAD_TIME
  const slots = createSlots({
    start,
    end,
    busy: data.busy,
    duration,
    leadTime,
    containers: data.containers,
  })

  // 6. Generate container strings
  const containerStrings = generateContainerStrings(bookingSlug)

  // 7. Build duration and pricing properties
  const allowedDurations = configuration?.allowedDurations ?? ALLOWED_DURATIONS
  const durationProps = buildDurationProps(duration, configuration)

  // 8. Assemble final return object
  const returnObj = {
    isExpired: false,
    durationProps,
    configuration,
    selectedDate,
    allowedDurations,
    slots,
    containerStrings,
    duration,
    data,
    start,
    end,
  }

  // 9. Check if promo is expired
  if (configuration && configuration.promoEndDate && isPromoExpired(configuration.promoEndDate)) {
    returnObj.isExpired = true
  }

  return returnObj
}
