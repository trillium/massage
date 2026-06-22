import { z } from 'zod'
import { AppointmentRequestSchema } from '@/lib/schema'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { intervalToHumanString } from '@/lib/intervalToHumanString'

export function AppointmentPushoverInstantConfirm(
  data: z.output<typeof AppointmentRequestSchema>,
  ownerTimeZone: string
) {
  const start = new Date(data.start)
  const end = new Date(data.end)
  const dateSummary = intervalToHumanString({ start, end, timeZone: ownerTimeZone })

  const title = `[CONFIRMED] ${data.firstName} confirmed ${data.duration}m appt ${dateSummary}, $${data.price || 'TBD'}`

  let message = `${data.firstName} ${data.lastName} — instant confirm\n`
  if (data.edgeMemberType) message += `Role: ${data.edgeMemberType}\n`
  message += `\n`
  message += `Date: ${dateSummary}\n`
  message += `Duration: ${data.duration} minutes\n`
  if (data.price) message += `Price: $${data.price}\n`
  message += `Location: ${data.locationString || (data.locationObject ? flattenLocation(data.locationObject) : '')}\n`
  message += `\n`
  if (data.phone && data.phone.trim() !== '') message += `Phone: ${data.phone}\n`
  if (data.telegramHandle && data.telegramHandle.trim() !== '')
    message += `Telegram: ${data.telegramHandle}\n`
  message += `Email: ${data.email}\n`
  if (data.hotelRoomNumber) message += `Hotel: ${data.hotelRoomNumber}\n`
  if (data.parkingInstructions) message += `Parking: ${data.parkingInstructions}\n`
  if (data.additionalNotes) message += `Notes: ${data.additionalNotes}\n`

  return { message, title }
}
