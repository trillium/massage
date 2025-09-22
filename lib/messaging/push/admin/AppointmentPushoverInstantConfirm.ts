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
  message += `\n[Instant Confirm - No Action Required]\n`

  return { message, title }
}
