import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { intervalToHumanString } from '@/lib/intervalToHumanString'

export default function requestEventDescription({
  firstName,
  lastName,
  email,
  phone,
  telegramHandle,
  start,
  end,
  duration,
  location,
  price,
  promo,
  timeZone,
  ownerTimeZone,
  additionalNotes,
  edgeMemberType,
  acceptUrl,
  declineUrl,
}: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  telegramHandle?: string
  start: string
  end: string
  duration: string
  location: string
  price?: string
  promo?: string
  timeZone: string
  ownerTimeZone: string
  additionalNotes?: string
  edgeMemberType?: string
  acceptUrl: string
  declineUrl: string
}) {
  const dateSummary = intervalToHumanString({
    start: new Date(start),
    end: new Date(end),
    timeZone: ownerTimeZone,
  })

  let output = `<b>${firstName} ${lastName}</b> — pending request\n`
  output += `${dateSummary} · ${duration} min\n`
  output += '\n'
  if (edgeMemberType) output += `<b>Role</b>: ${edgeMemberType}\n`
  output += `<b>Email</b>: ${email}\n`
  if (phone && phone.trim() !== '') output += `<b>Phone</b>: ${phone}\n`
  if (telegramHandle && telegramHandle.trim() !== '')
    output += `<b>Telegram</b>: ${telegramHandle}\n`
  output += `<b>Location</b>: ${location}\n`
  output += `<b>Timezone</b>: ${timeZone}\n`
  if (additionalNotes) output += `<b>Notes</b>: ${additionalNotes}\n`
  if (price) output += `<b>Price</b>: $${price}\n`
  if (promo) output += `<b>Promo</b>: ${promo}\n`
  output += '\n'
  output += `<b><a href="${acceptUrl}">✅ Accept</a></b>\n`
  output += `<b><a href="${declineUrl}">❌ Decline</a></b>\n`

  return output
}
