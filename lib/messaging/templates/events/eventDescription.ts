import { AppointmentProps } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'

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
  slugConfiguration,
}: Partial<AppointmentProps>) {
  let output = 'Thanks for booking!'
  output += '\n\n'
  output += `<b>Name</b>: ${firstName} ${lastName}\n`
  output += `<b>Date</b>: ${new Date(start || '').toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })}\n`
  output += `<b>Start</b>: ${new Date(start || '').toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })}\n`
  output += `<b>End</b>: ${new Date(end || '').toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })}\n`
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

  const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://trilliummassage.la'
  output += `<b>My Events</b>: <a href="${host}/my_events">View My Events</a>\n`

  output += '\n\n'
  output += 'Trillium Smith, LMT'
  output += '\n'
  output += `<a href="https://trilliummassage.la/">www.trilliummassage.la</a>\n`

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
