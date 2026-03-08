import { AppointmentProps } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { siteConfig } from '@/lib/siteConfig'

function eventDescription({
  start,
  end,
  phone,
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
  let output = 'Thanks for booking!'
  output += '\n\n'
  output += `<b>Name</b>: ${firstName} ${lastName}\n`
  output += `<b>Date</b>: ${new Date(start || '').toLocaleDateString('en-US', { timeZone: siteConfig.scheduling.timezone })}\n`
  output += `<b>Start</b>: ${new Date(start || '').toLocaleTimeString('en-US', { timeZone: siteConfig.scheduling.timezone })}\n`
  output += `<b>End</b>: ${new Date(end || '').toLocaleTimeString('en-US', { timeZone: siteConfig.scheduling.timezone })}\n`
  output += `<b>Duration</b>: ${duration}\n`
  if (email) {
    output += `<b>Email</b>: ${email}\n`
  }
  if (phone) {
    output += `<b>Phone</b>: ${phone}\n`
  }

  // Handle both string and LocationObject
  let locationString = ''
  if (typeof location === 'string') {
    locationString = location
  } else if (location && typeof location === 'object') {
    locationString = flattenLocation(location)
  }
  output += `<b>Location</b>: ${locationString}\n`

  if (additionalNotes) {
    output += `<b>Notes</b>: ${additionalNotes}\n`
  }

  if (promo) {
    output += `<b>Promo</b>: ${promo}\n`
  }

  if (bookingUrl) {
    output += `<b>Booking URL</b>: ${bookingUrl}\n`
  }

  if (source) {
    output += `<b>Source</b>: ${source}\n`
  }

  // Add slug configuration details (customer-relevant only)
  if (slugConfiguration) {
    output += '\n'
    output += `<b>--- Booking Details ---</b>\n`
    if (slugConfiguration.title) output += `<b>Service</b>: ${slugConfiguration.title}\n`
    if (slugConfiguration.eventContainer)
      output += `<b>Service Type</b>: ${slugConfiguration.eventContainer}\n`
    if (slugConfiguration.pricing) {
      output += `<b>Pricing</b>: ${Object.entries(slugConfiguration.pricing)
        .map(([dur, price]) => `${dur}min: $${price}`)
        .join(', ')}\n`
    }
    if (slugConfiguration.discount) {
      const discount = slugConfiguration.discount
      output += `<b>Discount Applied</b>: ${discount.type === 'percent' ? `${(discount.amountPercent || 0) * 100}% off` : `$${discount.amountDollars || 0} off`}\n`
    }
  }

  const domain = siteConfig.domain.siteUrl.replace(/\/$/, '')
  const domainDisplay = domain.replace(/^https?:\/\//, '')
  const host = origin || process.env.NEXT_PUBLIC_SITE_URL || domain
  output += `<b>My Events</b>: <a href="${host}/my_events">View My Events</a>\n`

  output += '\n\n'
  output += `${siteConfig.business.ownerName}, LMT`
  output += '\n'
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

  return output
}

export default eventDescription
