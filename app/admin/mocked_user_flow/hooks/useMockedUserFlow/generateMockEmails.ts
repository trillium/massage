import { intervalToHumanString } from 'lib/intervalToHumanString'
import { ApprovalEmail } from 'lib/messaging/email/admin/Approval'
import ClientRequestEmail from 'lib/messaging/email/client/ClientRequestEmail'
import { AppointmentRequestType } from '@/lib/types'

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
  const therapistEmailData = ApprovalEmail({
    ...data,
    location: data.locationObject || { street: '', city: data.locationString || '', zip: '' },
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
    location: data.locationObject || { street: '', city: data.locationString || '', zip: '' },
    email: data.email, // Explicitly pass the email
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: data.timeZone as string,
    }),
  })

  return { therapistEmailData, clientEmailData }
}
