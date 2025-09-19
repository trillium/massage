import { NextRequest, NextResponse } from 'next/server'
import { IncomingMessage } from 'http'
import { intervalToHumanString } from './intervalToHumanString'
import sendMail from './email'
import { ApprovalEmail } from './messaging/email/admin/Approval'
import ClientRequestEmail from './messaging/email/client/ClientRequestEmail'
import { getHash } from './hash'
import { AppointmentRequestSchema } from './schema'
import { z } from 'zod'
// Manual type for the result of schema.safeParse(jsonData) (for Zod v4)
import { pushoverSendMessage } from './messaging/push/admin/pushover'
import { AppointmentPushover } from './messaging/push/admin/AppointmentPushover'

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

    // Send confirmation email directly
    const confirmationEmail = await clientRequestEmailFn({
      ...data,
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
  const approveUrl = `${headers.get('origin') ?? '?'}\/api/confirm/?data=${encodeURIComponent(JSON.stringify(data))}&key=${getHashFn(JSON.stringify(data))}`
  const approveEmail = approvalEmailFn({
    ...data,
    approveUrl,
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: ownerTimeZone,
    }),
  })

  const pushover = AppointmentPushover(data, ownerTimeZone)

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
