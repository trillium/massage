/* ds-ignore-file */
import { AppointmentProps } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { siteConfig } from '@/lib/siteConfig'
import type { EditableFieldName } from '@/lib/helpers/parseEventDescription'

function getEditableFieldNames(
  slugConfiguration: AppointmentProps['slugConfiguration']
): EditableFieldName[] {
  const fields: EditableFieldName[] = ['firstName', 'lastName', 'email']
  if (!slugConfiguration?.hideLocation) fields.push('location')
  fields.push('phone')
  return fields
}

function eventDescription({
  start,
  end,
  phone,
  telegramHandle,
  duration,
  email,
  location,
  firstName,
  lastName,
  eventBaseString,
  eventMemberString,
  eventContainerString,
  bookingUrl,
  promo,
  source,
  additionalNotes,
  slugConfiguration,
  origin,
}: Partial<AppointmentProps> & { origin?: string }) {
  const tz = siteConfig.scheduling.timezone
  const date = new Date(start || '').toLocaleDateString('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const startTime = new Date(start || '').toLocaleTimeString('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  })
  const endTime = new Date(end || '').toLocaleTimeString('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  })

  let locationString = ''
  if (typeof location === 'string') {
    locationString = location
  } else if (location && typeof location === 'object') {
    locationString = flattenLocation(location)
  }

  let output = `<b>${firstName} ${lastName}</b>\n`
  output += `${date} · ${startTime}–${endTime} · ${duration} min\n`
  output += '\n'
  if (email) output += `<b>Email</b>: ${email}\n`
  if (phone && phone.trim() !== '') output += `<b>Phone</b>: ${phone}\n`
  if (telegramHandle && telegramHandle.trim() !== '')
    output += `<b>Telegram</b>: ${telegramHandle}\n`
  if (locationString) output += `<b>Location</b>: ${locationString}\n`
  if (additionalNotes) output += `<b>Notes</b>: ${additionalNotes}\n`

  if (slugConfiguration?.title) output += `\n<b>Service</b>: ${slugConfiguration.title}\n`
  if (promo) output += `<b>Promo</b>: ${promo}\n`
  if (slugConfiguration?.discount) {
    const d = slugConfiguration.discount
    output += `<b>Discount</b>: ${d.type === 'percent' ? `${(d.amountPercent || 0) * 100}% off` : `$${d.amountDollars || 0} off`}\n`
  }

  const domain = siteConfig.domain.siteUrl.replace(/\/$/, '')
  const domainDisplay = domain.replace(/^https?:\/\//, '')
  const host = origin || process.env.NEXT_PUBLIC_SITE_URL || domain
  output += `\n<a href="${host}/my_events"><b>View or manage your appointment →</b></a>\n`
  output += '\n'
  output += `${siteConfig.business.ownerName}, LMT\n`
  output += `<a href="${domain}/">www.${domainDisplay}</a>\n`

  if (eventBaseString) {
    output += '\n'
    output += eventBaseString
  }
  if (eventMemberString) {
    output += '\n'
    output += eventMemberString
  }
  if (eventContainerString) {
    output += '\n'
    output += eventContainerString
  }

  const editableFields = getEditableFieldNames(slugConfiguration)
  output += `\n${JSON.stringify({ editableFields })}`

  return output
}

export default eventDescription
