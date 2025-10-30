import { AppointmentProps } from '@/lib/types'

interface ManualEntryData {
  platform: string
  payout?: string
  tip?: string
  notes?: string
  isCouples?: boolean
}

async function manualAdminAppointmentDescription(
  appointmentProps: AppointmentProps
): Promise<string> {
  let manualEntryData: ManualEntryData = {
    platform: 'ManualEntry',
  }

  try {
    if (appointmentProps.promo) {
      manualEntryData = JSON.parse(appointmentProps.promo) as ManualEntryData
    }
  } catch (error) {
    console.error('Error parsing manual entry data from promo field:', error)
  }

  let manualEntrySection = ''

  if (manualEntryData.payout) {
    manualEntrySection += `<b>Payout</b>: $${manualEntryData.payout}\n`
  }

  if (manualEntryData.tip) {
    manualEntrySection += `<b>Tip</b>: $${manualEntryData.tip}\n`
  }

  if (manualEntryData.payout && manualEntryData.tip) {
    const total = parseFloat(manualEntryData.payout) + parseFloat(manualEntryData.tip)
    manualEntrySection += `<b>Total Earnings</b>: $${total.toFixed(2)}\n`
  }

  if (manualEntryData.isCouples) {
    manualEntrySection += `<b>Session Type</b>: Couples Massage\n`
  }

  if (manualEntryData.notes) {
    manualEntrySection += `<b>Notes</b>: ${manualEntryData.notes}\n`
  }

  return manualEntrySection
}

export default manualAdminAppointmentDescription
