import { AppointmentProps } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { generateSecureMyEventsUrlServer } from '@/lib/generateSecureMyEventsUrl'

/**
 * Creates a description for a calendar event.
 *
 * @function
 * @returns {string} Returns the summary string for an event.
 */
async function eventDescription({
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

  // Generate secure my_events URL if email is available
  if (email) {
    try {
      const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://trilliummassage.la'
      const myEventsUrl = await generateSecureMyEventsUrlServer(email, host)
      output += `<b><a href="${myEventsUrl}">My Events</a></b>\n`
    } catch (error) {
      console.error('Error generating secure my_events URL in event template:', error)
    }
  }

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
