import { AppointmentProps } from '@/lib/types'
import eventDescription from './eventDescription'

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
 * Generates the complete appointment description for admin-created Soothe bookings.
 * This extends the standard eventDescription with Soothe-specific information.
 *
 * @function
 * @param {AppointmentProps} appointmentProps - The appointment properties
 * @returns {Promise<string>} Returns the formatted appointment description
 */
async function adminAppointmentDescription(appointmentProps: AppointmentProps): Promise<string> {
  // For admin-created events, don't include client contact info since we don't have it
  const isAdminCreated = appointmentProps.email === process.env.OWNER_EMAIL

  // Create a modified props object without email and phone for admin events
  const descriptionProps = isAdminCreated
    ? { ...appointmentProps, email: undefined, phone: undefined }
    : appointmentProps

  // Get the standard event description
  const baseDescription = await eventDescription(descriptionProps)

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

export default adminAppointmentDescription
