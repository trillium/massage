import { EmailProps } from '@/lib/types'
import { parts as signatureParts } from '@/lib/messaging/utilities/signature'

const LINE_PREFIX = `<div class="gmail_default" style="font-family:arial,sans-serif">`
const LINE_SUFFIX = `</div>`

export default function ClientConfirmEmail({
  duration,
  price,
  firstName,
  dateSummary,
  location,
  bookingUrl,
  promo,
  eventPageUrl,
}: Omit<EmailProps, 'approveUrl'> & { eventPageUrl?: string }) {
  const SUBJECT = `Massage Session Confirmed $${price}, ${duration} minutes`

  let body = `<div dir="ltr">`
  body += [
    `Hi ${firstName || 'there'}`,
    `<br>`,
    `Great news! Your massage session has been confirmed.`,
    `<br>`,
    `<b>Date:</b> ${dateSummary}`,
    `<b>Location:</b> ${location}`,
    `${price ? `<b>Price:</b> $${price}` : ''}`,
    `${promo ? `<b>Promo Applied:</b> ${promo}` : ''}`,
    `<b>Duration:</b> ${duration} minutes`,
    `${bookingUrl ? `<b>Booking Page:</b> <a href="${bookingUrl}">${bookingUrl}</a>` : ''}`,
    `<br>`,
    `See you then!`,
    `<br>`,
    eventPageUrl ? `<b><a href="${eventPageUrl}">View or manage your appointment</a></b>` : '',
    `<br>`,
    `Thanks!`,
    `<br>`,
    ...signatureParts,
  ]
    .filter((line) => line.length > 0)
    .map((line) => `${LINE_PREFIX}${line}${LINE_SUFFIX}`)
    .join('')

  body += `</div>`

  return { subject: SUBJECT, body }
}
