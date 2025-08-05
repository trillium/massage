import { DEFAULT_PRICING, ALLOWED_DURATIONS } from 'config'
import { PricingType, SlugConfigurationType } from '@/lib/types'

export type durationProps = {
  title: string
  duration: number
  price: PricingType
  allowedDurations: number[]
  configuration: SlugConfigurationType | null
}

/**
 * Builds duration and pricing properties for the page configuration
 */
export function buildDurationProps(
  duration: number,
  configuration: SlugConfigurationType | null
): durationProps {
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
