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

  if (configuration?.maxDaysAhead && dataStart) {
    const startMs = new Date(`${dataStart}T00:00:00Z`).getTime()
    const cappedMs = startMs + (configuration.maxDaysAhead - 1) * 86400000
    const cappedEnd = dayFromDate(new Date(cappedMs))
    const cappedString = `${cappedEnd.year}-${String(cappedEnd.month).padStart(2, '0')}-${String(cappedEnd.day).padStart(2, '0')}`
    if (cappedString < effectiveEnd) effectiveEnd = cappedString
  }

  return dayFromString(effectiveEnd)
}
