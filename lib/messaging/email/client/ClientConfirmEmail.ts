import { buildEmailHtml } from '@/lib/messaging/email/htmlEmailBase'
import { siteConfig } from '@/lib/siteConfig'
import { EmailProps } from '@/lib/types'

export default function ClientConfirmEmail({
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
  const serviceNoun = siteConfig.business.serviceNoun
  const cap = serviceNoun.charAt(0).toUpperCase() + serviceNoun.slice(1)
  const SUBJECT = `${cap} Session Confirmed${price ? ` $${price},` : ','} ${duration} minutes`

  const locationStr = typeof location === 'string' ? location : ''
  const telegramLine = ownerTelegram
    ? `<p style="margin:8px 0 0">Questions? Message me on Telegram: <a href="https://t.me/${ownerTelegram.replace(/^@/, '')}" style="color:#dc2626">${ownerTelegram}</a></p>`
    : ''

  const body = buildEmailHtml({
    headerTitle: '✓ Booking Confirmed',
    preheader: `Your ${serviceNoun} session on ${dateSummary} is confirmed.`,
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
    bodyContent: `<p style="margin:0 0 8px">Hi ${firstName || 'there'},</p><p style="margin:0">Your ${serviceNoun} session has been confirmed. See you then!</p>${telegramLine}`,
    ctaHref: eventPageUrl || undefined,
    ctaLabel: eventPageUrl ? 'View or Manage Your Appointment' : undefined,
  })

  return { subject: SUBJECT, body }
}
