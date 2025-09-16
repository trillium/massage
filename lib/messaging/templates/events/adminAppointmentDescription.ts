import { AppointmentProps } from '@/lib/types'

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
  let sootheSection = ''

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

  // Combine base description with Soothe-specific data
  return sootheSection
}

export default adminAppointmentDescription
