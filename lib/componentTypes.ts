import { PricingType, SlugConfigurationType } from './configTypes'
import { GoogleCalendarV3Event } from './calendarTypes'
import { StringDateTimeIntervalAndLocation, DayWithStartEnd } from './availabilityTypes'
import { SearchParamsType } from './commonTypes'

export type durationPropsType = {
  title: string
  duration: number
  price: PricingType
  allowedDurations: number[]
  configuration: SlugConfigurationType | null
}

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
  durationProps: durationPropsType
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
