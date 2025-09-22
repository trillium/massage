import { z } from 'zod'
import { AppointmentRequestSchema } from '@/lib/schema'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { intervalToHumanString } from '@/lib/intervalToHumanString'

/**
 * Creates a pushover message for instant confirm appointment bookings.
 */
export function AppointmentPushoverInstantConfirm(
  data: z.output<typeof AppointmentRequestSchema>,
  ownerTimeZone: string
) {
  const start = new Date(data.start)
  const end = new Date(data.end)
  const dateSummary = intervalToHumanString({
    start,
    end,
    timeZone: ownerTimeZone,
  })

  const title = `[CONFIRMED] ${data.firstName} confirmed ${data.duration}m appt ${dateSummary}, $${data.price || 'TBD'}`

  let message = `${data.firstName} ${data.lastName} has confirmed an instant appointment:\n\n`
  message += `Date: ${dateSummary}\n`
  message += `Timezone: ${data.timeZone}\n`
  message += `Location: ${data.locationString || (data.locationObject ? flattenLocation(data.locationObject) : '')}\n`
  if (data.price) message += `Price: $${data.price}\n`
  if (data.promo) message += `Promo: ${data.promo}\n`
  message += `Duration: ${data.duration} minutes\n`
  message += `Phone: ${data.phone}\n`
  message += `Email: ${data.email}\n`

  // Add slug configuration details
  if (data.slugConfiguration) {
    message += `\n--- CONFIGURATION ---\n`
    message += `Type: ${data.slugConfiguration.type || 'N/A'}\n`
    if (data.slugConfiguration.title) message += `Title: ${data.slugConfiguration.title}\n`
    if (data.slugConfiguration.eventContainer)
      message += `Container: ${data.slugConfiguration.eventContainer}\n`
    if (data.slugConfiguration.blockingScope)
      message += `Blocking: ${data.slugConfiguration.blockingScope}\n`
    if (data.slugConfiguration.leadTimeMinimum)
      message += `Lead Time: ${data.slugConfiguration.leadTimeMinimum}min\n`
    if (data.slugConfiguration.instantConfirm) message += `Instant Confirm: Yes\n`
    if (data.slugConfiguration.acceptingPayment) message += `Accepting Payment: Yes\n`
    if (data.slugConfiguration.promoEndDate)
      message += `Promo End: ${data.slugConfiguration.promoEndDate}\n`
    if (data.slugConfiguration.allowedDurations)
      message += `Durations: ${data.slugConfiguration.allowedDurations.join(', ')}min\n`
    if (data.slugConfiguration.pricing) {
      message += `Pricing: ${Object.entries(data.slugConfiguration.pricing)
        .map(([dur, price]) => `${dur}min:$${price}`)
        .join(', ')}\n`
    }
    if (data.slugConfiguration.discount) {
      const discount = data.slugConfiguration.discount
      message += `Discount: ${discount.type === 'percent' ? `${(discount.amountPercent || 0) * 100}%` : `$${discount.amountDollars || 0}`}\n`
    }
  }

  message += `\n[Instant Confirm - No Action Required]\n`

  return { message, title }
}
