/* ds-ignore-file */
import { buildEmailHtml } from '@/lib/messaging/email/htmlEmailBase'
import { EmailProps } from '@/lib/types'

export default function ClientRequestEmail({
  duration,
  price,
  firstName,
  dateSummary,
  location,
  bookingUrl,
  promo,
  eventPageUrl,
  ownerTelegram,
}: Omit<EmailProps, 'approveUrl'> & { eventPageUrl?: string; ownerTelegram?: string }) {
  const SUBJECT = `Massage Session Request${price ? ` $${price},` : ','} ${duration} minutes`

  const locationStr = typeof location === 'string' ? location : ''
  const telegramLine = ownerTelegram
    ? `<p style="margin:8px 0 0">Questions? Message me on Telegram: <a href="https://t.me/${ownerTelegram.replace(/^@/, '')}" style="color:#dc2626">${ownerTelegram}</a></p>`
    : ''

  const body = buildEmailHtml({
    headerTitle: 'Appointment Request Received',
    preheader: `Your massage request for ${dateSummary} is being reviewed.`,
    infoRows: [
      { label: 'Date', value: dateSummary },
      { label: 'Location', value: locationStr || undefined },
      { label: 'Duration', value: `${duration} minutes` },
      { label: 'Price', value: price ? `$${price}` : undefined },
      { label: 'Promo', value: promo || undefined },
      {
        label: 'Booking Page',
        value: bookingUrl
          ? `<a href="${bookingUrl}" style="color:#dc2626">${bookingUrl}</a>`
          : undefined,
      },
    ],
    bodyContent: `<p style="margin:0 0 8px">Hi ${firstName || 'there'},</p><p style="margin:0">I received your appointment request! I'll review it as soon as I can and get back to you with a confirmation.</p>${telegramLine}`,
    ctaHref: eventPageUrl || undefined,
    ctaLabel: eventPageUrl ? 'View or Manage Your Appointment' : undefined,
  })

  return { subject: SUBJECT, body }
}
