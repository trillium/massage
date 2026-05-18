import { normalizeYYYYMMDD } from '@/lib/helpers'
import { dayFromString } from '@/lib/dayAsObject'
import { SlugConfigurationType } from '@/lib/types'

export function calculateEndDate(dataEnd: string, configuration?: SlugConfigurationType) {
  if (!configuration?.promoEndDate) return dayFromString(dataEnd)

  const normalizedPromoEnd = normalizeYYYYMMDD(configuration.promoEndDate)
  const effectiveEnd = normalizedPromoEnd < dataEnd ? normalizedPromoEnd : dataEnd
  return dayFromString(effectiveEnd)
}
