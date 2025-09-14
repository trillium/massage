import type { durationPropsType } from '@/lib/types'
import { DEFAULT_PRICING, ALLOWED_DURATIONS } from 'config'
import { PricingType, SlugConfigurationType } from '@/lib/types'

/**
 * Builds duration and pricing properties for the page configuration
 */
export function buildDurationProps(
  duration: number,
  configuration: SlugConfigurationType | null
): durationPropsType {
  const pricing = configuration?.pricing || DEFAULT_PRICING
  const allowedDurations = configuration?.allowedDurations ?? ALLOWED_DURATIONS

  const durationString = `${duration || '##'} minute session`
  const paymentString = configuration?.acceptingPayment ?? ' - $' + pricing[duration]
  const combinedString = durationString + paymentString

  return {
    title: combinedString,
    price: pricing,
    duration: duration,
    allowedDurations,
    configuration: configuration,
  }
}
