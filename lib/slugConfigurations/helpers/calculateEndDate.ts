import { normalizeYYYYMMDD } from '@/lib/helpers'
import { dayFromString } from '@/lib/dayAsObject'
import { SlugConfigurationType } from '@/lib/types'

/**
 * Calculates the effective end date considering promo constraints
 */
export function calculateEndDate(dataEnd: string, configuration?: SlugConfigurationType) {
  let end = dayFromString(dataEnd)

  // Limit end to the earlier of data.end and promoEndDate (inclusive) if present
  if (configuration?.promoEndDate) {
    const normalizedPromoEnd = normalizeYYYYMMDD(configuration.promoEndDate)
    if (normalizedPromoEnd < dataEnd) {
      end = dayFromString(normalizedPromoEnd)
    }
  }

  return end
}
