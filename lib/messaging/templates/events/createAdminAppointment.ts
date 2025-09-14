import { AppointmentProps } from '../../../types'

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

export default createAdminAppointment
