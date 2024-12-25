import type { AvailabilitySlotsMap } from './lib/types'

export const ALLOWED_DURATIONS = [60, 90, 120, 150]
export const VALID_DURATIONS = [15, 30, 45, 60, 90, 120, 150, 180, 210, 240]
export const DEFAULT_PRICING: { [key: number]: number } = {
  15: (140 * 1) / 4,
  30: (140 * 2) / 4,
  45: (140 * 3) / 4,
  60: (140 * 4) / 4,
  90: (140 * 6) / 4,
  120: (140 * 8) / 4,
  150: (140 * 10) / 4,
  180: (140 * 12) / 4,
  210: (140 * 14) / 4,
  240: (140 * 16) / 4,
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
