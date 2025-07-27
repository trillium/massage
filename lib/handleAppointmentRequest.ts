import { NextRequest, NextResponse } from 'next/server'
import { IncomingMessage } from 'http'
import { intervalToHumanString } from './intervalToHumanString'
import sendMail from './email'
import ApprovalEmail from './email/messages/Approval'
import ClientRequestEmail from './email/messages/ClientRequestEmail'
import { getHash } from './hash'
import { AppointmentRequestSchema } from './schema'

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
  appointmentRequestSchema,
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
  appointmentRequestSchema: typeof AppointmentRequestSchema
}) {
  const jsonData = await req.json()
  if (rateLimiter(req, headers)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const validationResult = appointmentRequestSchema.safeParse(jsonData)
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
  await sendMailFn({
    to: siteMetadata.email ?? '',
    subject: approveEmail.subject,
    body: approveEmail.body,
  })
  const confirmationEmail = clientRequestEmailFn({
    ...data,
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
