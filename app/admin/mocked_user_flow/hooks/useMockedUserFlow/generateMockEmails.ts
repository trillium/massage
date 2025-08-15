import { intervalToHumanString } from 'lib/intervalToHumanString'
import { ApprovalEmail } from 'lib/email/messages/Approval'
import ClientRequestEmail from 'lib/email/messages/ClientRequestEmail'
import { AppointmentRequestType } from '@/lib/schema'

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
    email: data.email, // Explicitly pass the email
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: data.timeZone as string,
    }),
  })

  return { therapistEmailData, clientEmailData }
}
