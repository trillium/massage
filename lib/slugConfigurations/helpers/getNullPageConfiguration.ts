// Default configuration for invalid or missing slugs
import {
  SlugConfigurationType,
  PricingType,
  DayWithStartEnd,
  StringDateTimeIntervalAndLocation,
  GoogleCalendarV3Event,
} from '@/lib/types'

export function getNullPageConfiguration(): {
  isExpired: boolean
  durationProps: {
    title: string
    duration: number
    price: PricingType
    allowedDurations: number[]
    configuration: SlugConfigurationType | null
  }
  configuration: SlugConfigurationType | null
  selectedDate: string | null
  allowedDurations: number[]
  slots: StringDateTimeIntervalAndLocation[]
  containerStrings: { eventMemberString: string; eventBaseString: string }
  duration: number
  data: { start: string; end: string; busy: []; containers?: GoogleCalendarV3Event[] }
  start: DayWithStartEnd
  end: DayWithStartEnd
} {
  return {
    isExpired: false,
    durationProps: {
      title: 'Session unavailable',
      duration: 90,
      price: {},
      allowedDurations: [],
      configuration: null,
    },
    configuration: null,
    selectedDate: null,
    allowedDurations: [],
    slots: [],
    containerStrings: { eventMemberString: '', eventBaseString: '' },
    duration: 90,
    data: { start: '', end: '', busy: [], containers: [] },
    start: { year: 1970, month: 1, day: 1, start: '', end: '' },
    end: { year: 1970, month: 1, day: 1, start: '', end: '' },
  }
}
