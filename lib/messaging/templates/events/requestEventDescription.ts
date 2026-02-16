import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { intervalToHumanString } from '@/lib/intervalToHumanString'

export default function requestEventDescription({
  firstName,
  lastName,
  email,
  phone,
  start,
  end,
  duration,
  location,
  price,
  promo,
  timeZone,
  ownerTimeZone,
  acceptUrl,
  declineUrl,
}: {
  firstName: string
  lastName: string
  email: string
  phone: string
  start: string
  end: string
  duration: string
  location: string
  price?: string
  promo?: string
  timeZone: string
  ownerTimeZone: string
  acceptUrl: string
  declineUrl: string
}) {
  const dateSummary = intervalToHumanString({
    start: new Date(start),
    end: new Date(end),
    timeZone: ownerTimeZone,
  })

  let output = `PENDING REQUEST\n\n`
  output += `<b>Name</b>: ${firstName} ${lastName}\n`
  output += `<b>Date</b>: ${dateSummary}\n`
  output += `<b>Duration</b>: ${duration} minutes\n`
  output += `<b>Email</b>: ${email}\n`
  output += `<b>Phone</b>: ${phone}\n`
  output += `<b>Location</b>: ${location}\n`
  output += `<b>Client Timezone</b>: ${timeZone}\n`
  if (price) output += `<b>Price</b>: $${price}\n`
  if (promo) output += `<b>Promo</b>: ${promo}\n`
  output += `\n`
  output += `<b><a href="${acceptUrl}">✅ Accept</a></b>\n`
  output += `<b><a href="${declineUrl}">❌ Decline</a></b>\n`

  return output
}
