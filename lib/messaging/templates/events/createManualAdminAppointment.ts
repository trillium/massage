import { AppointmentProps } from '@/lib/types'

interface ManualEntryData {
  platform: string
  payout?: string
  tip?: string
  notes?: string
  isCouples?: boolean
}

function generateTitle(
  booking: {
    clientName?: string
    sessionType?: string
    duration?: string
    isCouples?: boolean
    payout?: string
    tip?: string
  },
  fullName: string,
  payout: number,
  tip: number
): string {
  const clientDisplay = fullName || 'ClientNameOmitted'
  const sessionInfo = `${booking.duration || '60'}min ${booking.sessionType || 'Massage'} with ${clientDisplay}${booking.isCouples ? ' (Couples)' : ''}`

  const hasEarnings = payout > 0 || tip > 0
  if (!hasEarnings) {
    return `${sessionInfo} - ManualEntry`
  }

  const payoutStr = `$${payout}`
  const tipStr = tip > 0 ? `+$${tip}` : ''
  const total = payout + tip
  const earningsDisplay = `${payoutStr}${tipStr} ($${total})`

  return `${sessionInfo} ${earningsDisplay} - ManualEntry`
}

async function createManualAdminAppointment({
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
  const fullName = booking.clientName || ''
  const [firstName = 'ClientName', ...lastNameParts] = fullName.split(' ')
  const lastName = lastNameParts.join(' ') || 'Omitted'

  if (!process.env.OWNER_EMAIL) {
    throw new Error("OWNER_EMAIL isn't set")
  }

  const payout = parseFloat(booking.payout || '0') || 0
  const tip = parseFloat(booking.tip || '0') || 0

  const appointmentProps: AppointmentProps = {
    start: selectedTime.start,
    end: selectedTime.end,
    summary: generateTitle(booking, fullName, payout, tip),
    email: process.env.OWNER_EMAIL,
    phone: process.env.OWNER_PHONE_NUMBER || '(555) 000-0000',
    location: selectedLocation,
    timeZone: 'America/Los_Angeles',
    requestId: `manual-entry-${Date.now()}`,
    firstName,
    lastName,
    duration: booking.duration || '60',
    eventBaseString: '__EVENT__',
    bookingUrl: 'admin-created',
    source: 'Manual Entry Admin Interface',
    promo: JSON.stringify({
      platform: 'ManualEntry',
      payout: booking.payout,
      tip: booking.tip,
      notes: booking.notes,
      isCouples: booking.isCouples,
    } as ManualEntryData),
  }

  return appointmentProps
}

export default createManualAdminAppointment
