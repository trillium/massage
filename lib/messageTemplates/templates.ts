import { AppointmentProps, LocationObject, ContactFormType } from '../types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { generateSecureMyEventsUrlServer } from '@/lib/generateSecureMyEventsUrl'

/**
 * Creates a title "summary" for a calendar event.
 *
 * @function
 * @returns {string} Returns the summary string for an event.
 */
function eventSummary({ clientName, duration }: { clientName: string; duration: string }) {
  return `${duration} minute massage with ${clientName} - TrilliumMassage`
}

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
}: Partial<AppointmentProps>) {
  let output = 'Thanks for booking!'
  output += '\n\n'
  output += `<b>Name</b>: ${firstName} ${lastName}\n`
  output += `<b>Date</b>: ${new Date(start || '').toDateString()}\n`
  output += `<b>Start</b>: ${new Date(start || '').toLocaleTimeString()}\n`
  output += `<b>End</b>: ${new Date(end || '').toLocaleTimeString()}\n`
  output += `<b>Duration</b>: ${duration}\n`
  output += `<b>Email</b>: ${email}\n`
  output += `<b>Phone</b>: ${phone}\n`

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

  // Generate secure my_events URL if email is available
  if (email) {
    try {
      const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://trilliummassage.la'
      const myEventsUrl = await generateSecureMyEventsUrlServer(email, host)
      output += `<b>My Events</b>: ${myEventsUrl}\n`
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

/**
 * Creates an email body for contact form submissions.
 *
 * @function
 * @returns {string} Returns the email body string for a contact form submission.
 */
function contactFormEmail({ subject, name, email, phone, message }: ContactFormType) {
  let output = 'New Contact Form Submission'
  output += '\n\n'
  output += `<b>Subject</b>: ${subject}\n`
  output += `<b>Name</b>: ${name}\n`
  output += `<b>Email</b>: ${email}\n`
  output += `<b>Phone</b>: ${phone}\n`
  output += '\n'
  output += `<b>Message</b>:\n${message}\n`
  output += '\n\n'
  output += `Submitted on: ${new Date().toLocaleString()}`
  output += '\n\n'
  output += 'Trillium Smith, LMT'
  output += '\n'
  output += `<a href="https://trilliummassage.la/">www.trilliummassage.la</a>\n`

  return output
}

/**
 * Creates a confirmation email body for users who submit the contact form.
 *
 * @function
 * @returns {string} Returns the confirmation email body string.
 */
function contactFormConfirmation({ name, message }: ContactFormType) {
  const output = `
    <h2>Thank you for contacting Trillium Massage</h2>
    <p>Hi ${name},</p>
    <p>We've received your message and will get back to you within 24 hours.</p>
    <p><strong>Your message:</strong></p>
    <p>${message}</p>
    <br>
    <p>Best regards,</p>
    <p>Trillium Smith, LMT<br>
    <a href="https://trilliummassage.la/">www.trilliummassage.la</a></p>
  `

  return output
}

const templates = {
  eventSummary,
  eventDescription,
  contactFormEmail,
  contactFormConfirmation,
}

export default templates
