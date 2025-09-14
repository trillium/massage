// Default configuration for invalid or missing slugs
import {
  SlugConfigurationType,
  PricingType,
  DayWithStartEnd,
  StringDateTimeIntervalAndLocation,
  GoogleCalendarV3Event,
} from '@/lib/types'
import type { PageConfigurationReturnType } from '@/lib/slugConfigurations/createPageConfiguration.tsx'

export function getNullPageConfiguration(): PageConfigurationReturnType {
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
    instantConfirm: false,
    selectedDate: null,
    allowedDurations: [],
    slots: [],
    containerStrings: {
      eventBaseString: '',
      eventMemberString: '',
      eventContainerString: '',
    },
    duration: 90,
    data: {
      start: '',
      end: '',
      busy: [],
      containers: [],
    },
    start: { year: 1970, month: 1, day: 1, start: '', end: '' },
    end: { year: 1970, month: 1, day: 1, start: '', end: '' },
  }
}
