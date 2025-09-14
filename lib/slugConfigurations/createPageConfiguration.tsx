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

export type createPageConfigurationProps = {
  bookingSlug?: string
  resolvedParams: SearchParamsType
  overrides?: Partial<SlugConfigurationType>
  eventId?: string // For 'next', 'previous', 'next-previous' types when passing event ID
  currentEvent?: GoogleCalendarV3Event // For 'next' type when passing event object directly (avoids refetch)
  mocked?: {
    start: string
    end: string
    busy: Array<{ start: Date; end: Date }>
    timeZone?: string
    data?: Record<string, unknown>
  } | null
}

export type PageConfigurationReturnType = {
  isExpired: boolean
  durationProps: ReturnType<typeof buildDurationProps>
  configuration: SlugConfigurationType | null
  selectedDate: string | null
  allowedDurations: number[]
  slots: StringDateTimeIntervalAndLocation[] // Use the existing type for slots
  containerStrings: {
    eventBaseString: string
    eventMemberString: string
    eventContainerString: string
  }
  duration: number
  data: {
    start: string
    end: string
    busy: StringDateTimeIntervalAndLocation[]
    containers?: GoogleCalendarV3Event[]
    multiDurationSlots?: Record<number, StringDateTimeIntervalAndLocation[]>
    currentEvent?: GoogleCalendarV3Event
    nextEventFound?: boolean
    targetDate?: string
  }
  start: DayWithStartEnd
  end: DayWithStartEnd
  instantConfirm: boolean
  multiDurationSlots?: Record<number, StringDateTimeIntervalAndLocation[]>
  currentEvent?: GoogleCalendarV3Event
}

export async function createPageConfiguration({
  bookingSlug,
  resolvedParams,
  overrides,
  eventId,
  currentEvent,
  mocked,
}: createPageConfigurationProps): Promise<PageConfigurationReturnType> {
  // 1. Resolve configuration
  const configuration = await resolveConfiguration(bookingSlug, overrides)

  // If configuration type is null, this is an invalid slug
  if (configuration?.type === null) {
    // exit the function without running any fetch queries
    return getNullPageConfiguration()
  }

  // 2. Fetch data based on configuration and mocking requirements
  const data = await fetchPageData(
    configuration,
    resolvedParams,
    bookingSlug,
    mocked,
    eventId,
    currentEvent
  )

  // 3. Validate search parameters
  const { duration, selectedDate } = validateSearchParams({ searchParams: resolvedParams })

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
    slots = createSlots({
      start,
      end,
      busy: data.busy,
      duration,
      leadTime,
      containers: data.containers,
    })
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
      nextEventFound: data.nextEventFound,
      targetDate: data.targetDate,
    },
    start,
    end,
    instantConfirm: configuration.instantConfirm ?? false,
    multiDurationSlots: data.multiDurationSlots,
    currentEvent: data.currentEvent,
  }

  // 9. Check if promo is expired
  if (configuration && configuration.promoEndDate && isPromoExpired(configuration.promoEndDate)) {
    returnObj.isExpired = true
  }

  return returnObj
}
