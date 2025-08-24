import { NextRequest, NextResponse } from 'next/server'
import { IncomingMessage } from 'http'
import { intervalToHumanString } from './intervalToHumanString'
import sendMail from './email'
import { ApprovalEmail } from './email/messages/Approval'
import ClientRequestEmail from './email/messages/ClientRequestEmail'
import { getHash } from './hash'
import { AppointmentRequestSchema } from './schema'
import { z } from 'zod'
// Manual type for the result of schema.safeParse(jsonData) (for Zod v4)
import { pushoverSendMesage } from './pushover'
import { createTitle } from './pushover/createTitle'

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

  pushoverSendMesage({
    message: JSON.stringify(data, null, 2),
    title: createTitle(data),
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
