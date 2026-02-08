import { intervalToHumanString } from 'lib/intervalToHumanString'
import { ApprovalEmail } from 'lib/messaging/email/admin/Approval'
import ClientRequestEmail from 'lib/messaging/email/client/ClientRequestEmail'
import { AppointmentRequestType } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { escapeHtml } from '@/lib/messaging/escapeHtml'

export async function generateMockEmails({
  data,
  start,
  end,
  confirmUrl,
  duration,
  price,
}: {
  data: AppointmentRequestType
  start: Date
  end: Date
  confirmUrl: string
  duration: number
  price: { [key: number]: number }
}) {
  const safeLocation = escapeHtml(flattenLocation(data.locationObject || data.locationString || ''))
  const safeData = {
    firstName: escapeHtml(data.firstName),
    lastName: escapeHtml(data.lastName),
    phone: escapeHtml(data.phone),
    email: escapeHtml(data.email),
    promo: data.promo ? escapeHtml(data.promo) : data.promo,
    timeZone: escapeHtml(data.timeZone as string),
  }

  const therapistEmailData = ApprovalEmail({
    ...data,
    ...safeData,
    location: safeLocation,
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: 'America/Los_Angeles',
    }),
    timeZone: data.timeZone as string,
    approveUrl: confirmUrl,
    price: price[duration]?.toString() || '0',
  })

  const clientEmailData = await ClientRequestEmail({
    ...data,
    ...safeData,
    location: safeLocation,
    email: data.email, // Explicitly pass the email
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: data.timeZone as string,
    }),
  })

  return { therapistEmailData, clientEmailData }
}
