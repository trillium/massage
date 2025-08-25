import type { AvailabilitySlotsMap, PricingType } from './lib/types'

export const ALLOWED_DURATIONS = [60, 90, 120, 150]
export const VALID_DURATIONS = [5, 10, 15, 30, 45, 60, 90, 120, 150, 180, 210, 240]
const default_price = 140
export const DEFAULT_PRICING: PricingType = {
  15: (default_price * 1) / 4,
  30: (default_price * 2) / 4,
  45: (default_price * 3) / 4,
  60: (default_price * 4) / 4,
  90: (default_price * 6) / 4,
  120: (default_price * 8) / 4,
  150: (default_price * 10) / 4,
  180: (default_price * 12) / 4,
  210: (default_price * 14) / 4,
  240: (default_price * 16) / 4,
}
export const DEFAULT_DURATION = 90

export const CALENDARS_TO_CHECK = [
  'primary',
  'trillium@hatsfabulous.com',
  'trillium@trilliumsmith.com',
]
export const SLOT_PADDING = 0
export const OWNER_TIMEZONE = 'America/Los_Angeles'
export const LEAD_TIME = 3 * 60 // 3 hours
export const DEFAULT_APPOINTMENT_INTERVAL = 30 // minutes

const DEFAULT_WORKDAY = [
  {
    start: {
      hour: 10,
    },
    end: {
      hour: 23,
    },
  },
]

export const OWNER_AVAILABILITY: AvailabilitySlotsMap = {
  0: DEFAULT_WORKDAY,
  1: DEFAULT_WORKDAY,
  2: DEFAULT_WORKDAY,
  3: DEFAULT_WORKDAY,
  4: DEFAULT_WORKDAY,
  5: DEFAULT_WORKDAY,
  6: DEFAULT_WORKDAY,
}

export const LOCAL_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  weekday: 'long',
}

export const LOCAL_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: 'numeric',
}
