import { AppointmentProps, LocationObject, ContactFormType } from '../types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { generateSecureMyEventsUrlServer } from '@/lib/generateSecureMyEventsUrl'

/**
 * Interface for Soothe booking data stored in the promo field
 */
interface SootheBookingData {
  platform: string
  payout?: string
  tip?: string
  extraServices?: string[]
  notes?: string
  isCouples?: boolean
  originalMessageId?: string
}

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
  source,
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

  if (source) {
    output += `<b>Source</b>: ${source}\n`
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

/**
 * Creates an admin calendar appointment using Soothe booking data and user selections.
 * This function transforms Soothe booking information into an AppointmentProps structure
 * and generates a calendar event with proper description formatting.
 *
 * @function
 * @param {Object} params - The appointment creation parameters
 * @param {Object} params.booking - The Soothe booking data
 * @param {Object} params.selectedTime - The selected time interval
 * @param {string} params.selectedLocation - The selected location string
 * @param {Date} params.selectedDay - The selected day
 * @returns {Promise<AppointmentProps>} Returns the appointment props for calendar creation
 */
async function createAdminAppointment({
  booking,
  selectedTime,
  selectedLocation,
  selectedDay,
}: {
  booking: {
    clientName?: string
    sessionType?: string
    duration?: string
    isCouples?: boolean
    location?: string
    payout?: string
    tip?: string
    notes?: string
    extraServices?: string[]
    messageId: string
    date: string
    subject: string
  }
  selectedTime: {
    start: string
    end: string
  }
  selectedLocation: string
  selectedDay: {
    year: number
    month: number
    day: number
    toString: () => string
  }
}): Promise<AppointmentProps> {
  // Parse client name
  const fullName = booking.clientName || 'Unknown Client'
  const [firstName = 'Unknown', ...lastNameParts] = fullName.split(' ')
  const lastName = lastNameParts.join(' ') || 'Client'

  if (!process.env.OWNER_EMAIL) {
    throw new Error("OWNER_EMAIL isn't set")
  }

  // Create appointment props compatible with existing system
  const appointmentProps: AppointmentProps = {
    start: selectedTime.start,
    end: selectedTime.end,
    summary: `${booking.duration || '60'}min ${booking.sessionType || 'Massage'} with ${fullName}${booking.isCouples ? ' (Couples)' : ''} - Soothe`,
    email: process.env.OWNER_EMAIL,
    phone: process.env.OWNER_PHONE_NUMBER || '(555) 000-0000',
    location: {
      street: selectedLocation.split('\n')[0] || selectedLocation.split(',')[0] || selectedLocation,
      city: selectedLocation.includes('Los Angeles')
        ? 'Los Angeles'
        : selectedLocation.match(/,\s*([^,]+),\s*[A-Z]{2}/)?.[1] || 'Unknown City',
      zip: selectedLocation.match(/\b\d{5}\b/)?.[0] || '90210',
    },
    timeZone: 'America/Los_Angeles',
    requestId: `soothe-${booking.messageId}-${Date.now()}`,
    firstName,
    lastName,
    duration: booking.duration || '60',
    eventBaseString: 'SOOTHE_ADMIN_BOOKING',
    eventMemberString: booking.sessionType || 'massage',
    eventContainerString: `soothe-${booking.isCouples ? 'couples' : 'single'}`,
    bookingUrl: 'admin-created',
    source: 'Soothe Admin Interface',
    // Add Soothe-specific data in promo field for tracking
    promo: JSON.stringify({
      platform: 'Soothe',
      payout: booking.payout,
      tip: booking.tip,
      extraServices: booking.extraServices,
      notes: booking.notes,
      isCouples: booking.isCouples,
      originalMessageId: booking.messageId,
    }),
  }

  return appointmentProps
}

/**
 * Generates the complete appointment description for admin-created Soothe bookings.
 * This extends the standard eventDescription with Soothe-specific information.
 *
 * @function
 * @param {AppointmentProps} appointmentProps - The appointment properties
 * @returns {Promise<string>} Returns the formatted appointment description
 */
async function adminAppointmentDescription(appointmentProps: AppointmentProps): Promise<string> {
  // Get the standard event description
  const baseDescription = await eventDescription(appointmentProps)

  // Parse Soothe-specific data from promo field
  let sootheData: SootheBookingData = {
    platform: 'Soothe',
  }
  try {
    if (appointmentProps.promo) {
      sootheData = JSON.parse(appointmentProps.promo) as SootheBookingData
    }
  } catch (error) {
    console.error('Error parsing Soothe data from promo field:', error)
  }

  // Add Soothe-specific information
  let sootheSection = '\n\n<b>Soothe Booking Details:</b>\n'

  if (sootheData.payout) {
    sootheSection += `<b>Payout</b>: $${sootheData.payout}\n`
  }

  if (sootheData.tip) {
    sootheSection += `<b>Tip</b>: $${sootheData.tip}\n`
  }

  if (sootheData.payout && sootheData.tip) {
    const total = parseFloat(sootheData.payout) + parseFloat(sootheData.tip)
    sootheSection += `<b>Total Earnings</b>: $${total.toFixed(2)}\n`
  }

  if (sootheData.isCouples) {
    sootheSection += `<b>Session Type</b>: Couples Massage\n`
  }

  if (sootheData.extraServices && sootheData.extraServices.length > 0) {
    sootheSection += `<b>Extra Services</b>: ${sootheData.extraServices.join(', ')}\n`
  }

  if (sootheData.notes) {
    sootheSection += `<b>Soothe Notes</b>: ${sootheData.notes}\n`
  }

  if (sootheData.originalMessageId) {
    sootheSection += `<b>Original Message ID</b>: ${sootheData.originalMessageId}\n`
  }

  // Combine base description with Soothe-specific data
  return baseDescription + sootheSection
}

const templates = {
  eventSummary,
  eventDescription,
  contactFormEmail,
  contactFormConfirmation,
  createAdminAppointment,
  adminAppointmentDescription,
}

export default templates
