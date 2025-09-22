import { EmailProps } from '@/lib/types'
import { parts as signatureParts } from '@/lib/messaging/utilities/signature'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { generateSecureMyEventsUrlServer } from '@/lib/generateSecureMyEventsUrl'

const LINE_PREFIX = `<div class="gmail_default" style="font-family:arial,sans-serif">`
const LINE_SUFFIX = `</div>`

export default async function ClientConfirmEmail({
  duration,
  price,
  firstName,
  dateSummary,
  location,
  bookingUrl,
  promo,
  email,
}: Omit<EmailProps, 'approveUrl'> & { email: string }) {
  const SUBJECT = `Massage Session Confirmed $${price}, ${duration} minutes`

  // Generate secure my_events URL
  let myEventsUrl = ''
  try {
    // Use a fallback host if needed - this should be set from the calling context
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://trilliummassage.la'
    myEventsUrl = await generateSecureMyEventsUrlServer(email, host)
  } catch (error) {
    console.error('Error generating secure my_events URL:', error)
  }

  let body = `<div dir="ltr">`
  body += [
    `Hi ${firstName || 'there'}`,
    `<br>`,
    `Great news! Your massage session has been confirmed.`,
    `<br>`,
    `<b>Date:</b> ${dateSummary}`,
    `<b>Location:</b> ${flattenLocation(location)}`,
    `${price ? `<b>Price:</b> $${price}` : ''}`,
    `${promo ? `<b>Promo Applied:</b> ${promo}` : ''}`,
    `<b>Duration:</b> ${duration} minutes`,
    `${bookingUrl ? `<b>Booking Page:</b> <a href="${bookingUrl}">${bookingUrl}</a>` : ''}`,
    `<br>`,
    `See you then!`,
    `<br>`,
    myEventsUrl ? `<b><a href="${myEventsUrl}">View your appointments</a></b>` : '',
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
