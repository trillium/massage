import { EmailProps } from '@/lib/types'
import { parts as signatureParts } from './emailSegments/signature'

const LINE_PREFIX = `<div class="gmail_default" style="font-family:arial,sans-serif">`
const LINE_SUFFIX = `</div>`

export default function ClientConfirmationEmail({
  duration,
  price,
  firstName,
  dateSummary,
  location,
  confirmUrl,
}: Omit<EmailProps, 'approveUrl'> & { confirmUrl: string }) {
  const SUBJECT = `Please confirm your massage appointment - ${duration} minutes`

  let body = `<div dir="ltr">`
  body += [
    `Hi ${firstName || 'there'},`,
    `<br>`,
    `Thank you for your appointment request! Please confirm your booking by clicking the link below:`,
    `<br>`,
    `<a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0;">Confirm My Appointment</a>`,
    `<br>`,
    `<b>Appointment Details:</b>`,
    `<b>Date:</b> ${dateSummary}`,
    `<b>Location:</b> ${location}`,
    `${price ? `<b>Price:</b> $${price}` : ''}`,
    `<b>Duration:</b> ${duration} minutes`,
    `<br>`,
    `If you cannot click the link above, copy and paste this URL into your browser:`,
    `${confirmUrl}`,
    `<br>`,
    `This confirmation link will expire in 24 hours.`,
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
