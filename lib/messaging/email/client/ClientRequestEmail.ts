import { EmailProps } from '@/lib/types'
import { parts as signatureParts } from '@/lib/messaging/utilities/signature'

const LINE_PREFIX = `<div class="gmail_default" style="font-family:arial,sans-serif">`
const LINE_SUFFIX = `</div>`

export default async function ClientRequestEmail({
  duration,
  price,
  firstName,
  dateSummary,
  location,
  bookingUrl,
  promo,
  eventPageUrl,
}: Omit<EmailProps, 'approveUrl'> & { eventPageUrl?: string }) {
  const SUBJECT = `Massage Session Request $${price}, ${duration} minutes`

  let body = `<div dir="ltr">`
  body += [
    `Hi ${firstName || 'there'}`,
    `<br>`,
    `Just letting you know I received your appointment request!`,
    `<br>`,
    `<b>Date:</b> ${dateSummary}`,
    `<b>Location:</b> ${location}`,
    `${price ? `<b>Price:</b> $${price}` : ''}`,
    `${promo ? `<b>Promo Applied:</b> ${promo}` : ''}`,
    `<b>Duration:</b> ${duration} minutes`,
    `${bookingUrl ? `<b>Booking Page:</b> <a href="${bookingUrl}">${bookingUrl}</a>` : ''}`,
    `<br>`,
    `I'll review it as soon as I can and get back to you with a confirmation.`,
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
