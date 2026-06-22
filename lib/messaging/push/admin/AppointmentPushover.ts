import { z } from 'zod'
import { AppointmentRequestSchema } from '@/lib/schema'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { intervalToHumanString } from '@/lib/intervalToHumanString'

export function AppointmentPushover(
  data: z.output<typeof AppointmentRequestSchema>,
  ownerTimeZone: string,
  approveUrl: string,
  declineUrl?: string
) {
  const start = new Date(data.start)
  const end = new Date(data.end)
  const dateSummary = intervalToHumanString({ start, end, timeZone: ownerTimeZone })

  const title = `[REQUEST] ${data.firstName} requests ${data.duration}m appt ${dateSummary}, $${data.price || 'TBD'}`

  let message = `${data.firstName} ${data.lastName} has requested an appointment:\n`
  if (data.edgeMemberType) message += `Role: ${data.edgeMemberType}\n`
  message += `\n`
  message += `Date: ${dateSummary}\n`
  message += `Duration: ${data.duration} minutes\n`
  if (data.price) message += `Price: $${data.price}\n`
  if (data.promo) message += `Promo: ${data.promo}\n`
  message += `Location: ${data.locationString || (data.locationObject ? flattenLocation(data.locationObject) : '')}\n`
  message += `\n`
  if (data.phone && data.phone.trim() !== '') message += `Phone: ${data.phone}\n`
  if (data.telegramHandle && data.telegramHandle.trim() !== '')
    message += `Telegram: ${data.telegramHandle}\n`
  message += `Email: ${data.email}\n`
  if (data.hotelRoomNumber) message += `Hotel: ${data.hotelRoomNumber}\n`
  if (data.parkingInstructions) message += `Parking: ${data.parkingInstructions}\n`
  if (data.additionalNotes) message += `Notes: ${data.additionalNotes}\n`

  if (data.slugConfiguration) {
    const sc = data.slugConfiguration
    const configLines: string[] = []
    if (sc.title) configLines.push(`Booking: ${sc.title}`)
    if (sc.acceptingPayment) configLines.push(`Payment: Yes`)
    if (sc.promoEndDate) configLines.push(`Promo End: ${sc.promoEndDate}`)
    if (sc.discount) {
      const d = sc.discount
      configLines.push(
        `Discount: ${d.type === 'percent' ? `${(d.amountPercent || 0) * 100}%` : `$${d.amountDollars || 0}`}`
      )
    }
    if (configLines.length > 0) {
      message += `\n${configLines.join('\n')}\n`
    }
  }

  message += `\n✅ Approve: ${approveUrl}\n`
  if (declineUrl) message += `❌ Decline: ${declineUrl}\n`

  return { message, title }
}
