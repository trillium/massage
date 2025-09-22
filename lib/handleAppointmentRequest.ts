import { NextRequest, NextResponse } from 'next/server'
import { IncomingMessage } from 'http'
import { intervalToHumanString } from './intervalToHumanString'
import sendMail from './email'
import { ApprovalEmail } from './messaging/email/admin/Approval'
import ClientRequestEmail from './messaging/email/client/ClientRequestEmail'
import ClientConfirmEmail from './messaging/email/client/ClientConfirmEmail'
import { getHash } from './hash'
import { AppointmentRequestSchema } from './schema'
import { z } from 'zod'
// Manual type for the result of schema.safeParse(jsonData) (for Zod v4)
import { pushoverSendMessage } from './messaging/push/admin/pushover'
import { AppointmentPushover } from './messaging/push/admin/AppointmentPushover'
import { AppointmentPushoverInstantConfirm } from './messaging/push/admin/AppointmentPushoverInstantConfirm'
import { createGeneralApprovalUrl } from './messaging/utilities/createApprovalUrl'
import createCalendarAppointment from './availability/createCalendarAppointment'
import eventSummary from './messaging/templates/events/eventSummary'

export type AppointmentRequestValidationResult =
  | { success: true; data: z.output<typeof AppointmentRequestSchema> }
  | { success: false; error: z.ZodError<z.input<typeof AppointmentRequestSchema>> }

export async function handleAppointmentRequest({
  req,
  headers,
  sendMailFn,
  siteMetadata,
  ownerTimeZone,
  approvalEmailFn,
  clientRequestEmailFn,
  clientConfirmEmailFn,
  getHashFn,
  rateLimiter,
  schema,
}: {
  req: NextRequest & IncomingMessage
  headers: Headers
  sendMailFn: typeof sendMail
  siteMetadata: { email?: string }
  ownerTimeZone: string
  approvalEmailFn: typeof ApprovalEmail
  clientRequestEmailFn: typeof ClientRequestEmail
  clientConfirmEmailFn: typeof ClientConfirmEmail
  getHashFn: typeof getHash
  rateLimiter: (req: NextRequest & IncomingMessage, headers: Headers) => boolean
  schema: typeof AppointmentRequestSchema
}) {
  const jsonData = await req.json()
  if (rateLimiter(req, headers)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const validationResult: AppointmentRequestValidationResult = schema.safeParse(jsonData)
  if (!validationResult.success) {
    return NextResponse.json(validationResult.error.message, { status: 400 })
  }
  const { data } = validationResult

  // Check if instantConfirm is true
  if (data.instantConfirm) {
    const start = new Date(data.start)
    const end = new Date(data.end)

    // Create the calendar appointment directly
    const location = data.locationObject || { street: '', city: data.locationString || '', zip: '' }
    const requestId = getHashFn(JSON.stringify(data))

    await createCalendarAppointment({
      ...data,
      location,
      requestId,
      summary:
        eventSummary({
          duration: data.duration,
          clientName: `${data.firstName} ${data.lastName}`,
        }) || 'Instant Confirm Appointment',
    })

    // Send pushover notification for instant confirm
    const pushover = AppointmentPushoverInstantConfirm(data, ownerTimeZone)

    pushoverSendMessage({
      message: pushover.message,
      title: pushover.title,
      priority: 0,
    })

    // Send confirmation email directly
    const confirmationEmail = await clientConfirmEmailFn({
      ...data,
      location,
      email: data.email, // Explicitly pass the email
      dateSummary: intervalToHumanString({
        start,
        end,
        timeZone: data.timeZone,
      }),
    })
    await sendMailFn({
      to: data.email,
      subject: confirmationEmail.subject,
      body: confirmationEmail.body,
    })

    return NextResponse.json({ success: true, instantConfirm: true }, { status: 200 })
  }

  const start = new Date(data.start)
  const end = new Date(data.end)
  const approveUrl = createGeneralApprovalUrl(headers, data, getHashFn)
  const approveEmail = approvalEmailFn({
    ...data,
    location: data.locationObject || { street: '', city: data.locationString || '', zip: '' },
    approveUrl,
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: ownerTimeZone,
    }),
    data, // Pass the full data object for custom fields
  })

  const pushover = AppointmentPushover(data, ownerTimeZone, approveUrl)

  pushoverSendMessage({
    message: pushover.message,
    title: pushover.title,
    priority: 0,
  })

  await sendMailFn({
    to: siteMetadata.email ?? '',
    subject: approveEmail.subject,
    body: approveEmail.body,
  })
  const confirmationEmail = await clientRequestEmailFn({
    ...data,
    location: data.locationObject || { street: '', city: data.locationString || '', zip: '' },
    email: data.email, // Explicitly pass the email
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: data.timeZone,
    }),
  })
  await sendMailFn({
    to: data.email,
    subject: confirmationEmail.subject,
    body: confirmationEmail.body,
  })
  return NextResponse.json({ success: true }, { status: 200 })
}
