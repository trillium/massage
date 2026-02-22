import { siteConfig } from '@/lib/siteConfig'
import type { AvailabilitySlotsMap, PricingType } from './lib/types'

export const ALLOWED_DURATIONS = siteConfig.scheduling.allowedDurations
export const VALID_DURATIONS = siteConfig.scheduling.validDurations
const default_price = siteConfig.pricing.baseHourlyRate
export const DEFAULT_PRICING: PricingType = {
  5: (default_price * 1) / 12,
  10: (default_price * 2) / 12,
  15: (default_price * 1) / 4,
  20: (default_price * 4) / 12,
  25: (default_price * 5) / 12,
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
export const DEFAULT_DURATION = siteConfig.scheduling.defaultDuration

export const CALENDARS_TO_CHECK = siteConfig.calendars
export const SLOT_PADDING = siteConfig.scheduling.slotPadding
export const OWNER_TIMEZONE = siteConfig.scheduling.timezone
export const LEAD_TIME = siteConfig.scheduling.leadTimeMinutes
export const DEFAULT_APPOINTMENT_INTERVAL = siteConfig.scheduling.appointmentIntervalMinutes

const buildWorkday = (day: { startHour: number; endHour: number }) => [
  { start: { hour: day.startHour }, end: { hour: day.endHour } },
]

export const OWNER_AVAILABILITY: AvailabilitySlotsMap = Object.fromEntries(
  Object.entries(siteConfig.scheduling.workdays).map(([day, hours]) => [
    Number(day),
    buildWorkday(hours),
  ])
)

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
