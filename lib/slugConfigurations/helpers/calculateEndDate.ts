import { endOfWeek, startOfWeek } from 'date-fns'
import { normalizeYYYYMMDD } from '@/lib/helpers'
import { dayFromString, dayFromDate } from '@/lib/dayAsObject'
import { SlugConfigurationType } from '@/lib/types'

export function calculateEndDate(
  dataEnd: string,
  configuration?: SlugConfigurationType,
  dataStart?: string
) {
  let effectiveEnd = dataEnd

  if (configuration?.promoEndDate) {
    const normalizedPromoEnd = normalizeYYYYMMDD(configuration.promoEndDate)
    if (normalizedPromoEnd < effectiveEnd) effectiveEnd = normalizedPromoEnd
  }

  if (configuration?.calendarWeeks && dataStart) {
    const startDate = new Date(`${dataStart}T00:00:00`)
    const weekStart = startOfWeek(startDate)
    const lastWeekStartMs = weekStart.getTime() + (configuration.calendarWeeks - 1) * 7 * 86400000
    const cappedEndDate = endOfWeek(new Date(lastWeekStartMs))
    const cappedDay = dayFromDate(cappedEndDate)
    const cappedString = `${cappedDay.year}-${String(cappedDay.month).padStart(2, '0')}-${String(cappedDay.day).padStart(2, '0')}`
    if (cappedString < effectiveEnd) effectiveEnd = cappedString
  }

  return dayFromString(effectiveEnd)
}
