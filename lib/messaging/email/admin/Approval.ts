/* ds-ignore-file */
import { z } from 'zod'
import { EmailProps } from '@/lib/types'
import { AppointmentRequestSchema } from '@/lib/schema'
import { buildEmailHtml } from '@/lib/messaging/email/htmlEmailBase'

export function ApprovalEmail({
  email,
  firstName,
  lastName,
  location,
  dateSummary,
  approveUrl,
  declineUrl,
  timeZone,
  price,
  phone,
  telegramHandle,
  duration,
  bookingUrl,
  promo,
  slugConfiguration,
  data,
}: EmailProps & { data?: z.output<typeof AppointmentRequestSchema> }) {
  const SUBJECT = `REQUEST: ${firstName} ${lastName}, ${duration} minutes${price ? `, $${price}` : ''}`

  const locationStr = typeof location === 'string' ? location : ''

  let configHtml = ''
  if (slugConfiguration) {
    const rows: string[] = []
    if (slugConfiguration.type) rows.push(`<b>Type:</b> ${slugConfiguration.type}`)
    if (slugConfiguration.title) rows.push(`<b>Booking:</b> ${slugConfiguration.title}`)
    if (slugConfiguration.instantConfirm) rows.push(`<b>Instant Confirm:</b> Yes`)
    if (slugConfiguration.acceptingPayment) rows.push(`<b>Accepting Payment:</b> Yes`)
    if (slugConfiguration.promoEndDate)
      rows.push(`<b>Promo End:</b> ${slugConfiguration.promoEndDate}`)
    if (slugConfiguration.discount) {
      const d = slugConfiguration.discount
      const val =
        d.type === 'percent'
          ? `${(d.amountPercent || 0) * 100}% off`
          : `$${d.amountDollars || 0} off`
      rows.push(`<b>Discount:</b> ${val}`)
    }
    if (rows.length > 0) {
      configHtml = `<div style="margin-top:8px;padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px"><p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Booking Configuration</p>${rows.map((r) => `<p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#374151">${r}</p>`).join('')}</div>`
    }
  }

  const body = buildEmailHtml({
    headerTitle: `Request from ${firstName} ${lastName}`,
    preheader: `${firstName} ${lastName} requested ${duration} min on ${dateSummary}`,
    infoRows: [
      { label: 'Timezone', value: timeZone },
      { label: 'Date', value: dateSummary },
      { label: 'Role', value: data?.edgeMemberType || undefined },
      { label: 'Location', value: locationStr || undefined },
      { label: 'Duration', value: `${duration} minutes` },
      { label: 'Price', value: price ? `$${price}` : undefined },
      { label: 'Promo', value: promo || undefined },
      { label: 'Phone', value: phone && phone.trim() !== '' ? phone : undefined },
      {
        label: 'Telegram',
        value: telegramHandle && telegramHandle.trim() !== '' ? telegramHandle : undefined,
      },
      { label: 'Email', value: email },
      { label: 'Hotel Room', value: data?.hotelRoomNumber || undefined },
      { label: 'Parking', value: data?.parkingInstructions || undefined },
      { label: 'Notes', value: data?.additionalNotes || undefined },
      {
        label: 'Booking Page',
        value: bookingUrl
          ? `<a href="${bookingUrl}" style="color:#dc2626">${bookingUrl}</a>`
          : undefined,
      },
    ],
    ctaHref: approveUrl,
    ctaLabel: '✓ Accept Appointment',
    secondaryCtaHref: declineUrl,
    secondaryCtaLabel: '✗ Decline',
    footerExtra: configHtml || undefined,
  })

  return { subject: SUBJECT, body }
}
