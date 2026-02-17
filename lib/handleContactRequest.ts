import { NextRequest, NextResponse } from 'next/server'
import { IncomingMessage } from 'http'
import sendMail from './email'
import { getHash } from './hash'
import { ContactFormSchema } from './schema'
import { z } from 'zod'
import { ContactFormType } from './types'
import contactFormEmail from './messaging/email/admin/contactFormEmail'
import contactFormConfirmation from './messaging/email/client/contactFormConfirmation'
import { ContactPushover } from './messaging/push/admin/ContactPushover'
import { pushoverSendMessage } from './messaging/push/admin/pushover'
import { escapeHtml } from './messaging/escapeHtml'

export type ContactRequestValidationResult =
  | { success: true; data: z.output<typeof ContactFormSchema> }
  | { success: false; error: z.ZodError<z.input<typeof ContactFormSchema>> }

export async function handleContactRequest({
  req,
  headers,
  sendMailFn,
  siteMetadata,
  rateLimiter,
  schema,
}: {
  req: NextRequest
  headers: Headers
  sendMailFn: typeof sendMail
  siteMetadata: { email?: string }
  rateLimiter: (req: NextRequest, headers: Headers) => boolean
  schema: typeof ContactFormSchema
}) {
  const jsonData = await req.json()

  if (rateLimiter(req, headers)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const validationResult: ContactRequestValidationResult = schema.safeParse(jsonData)
  if (!validationResult.success) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const { data } = validationResult

  const safeData = {
    subject: escapeHtml(data.subject),
    name: escapeHtml(data.name),
    email: escapeHtml(data.email),
    phone: escapeHtml(data.phone),
    message: escapeHtml(data.message),
  }

  // Generate admin notification email using template
  const adminEmailBody = contactFormEmail(safeData)

  // Send Pushover notification to admin
  const pushover = ContactPushover(data)
  pushoverSendMessage({
    title: pushover.title,
    message: pushover.message,
    priority: 0,
  })

  // Send email to admin
  await sendMailFn({
    to: siteMetadata.email ?? '',
    subject: `New Contact Form: ${data.subject}`,
    body: adminEmailBody,
  })

  // Generate user confirmation email using template
  const userEmailBody = contactFormConfirmation(safeData)

  // Send confirmation email to user
  await sendMailFn({
    to: data.email,
    subject: 'Thank you for contacting Trillium Massage',
    body: userEmailBody,
  })

  return NextResponse.json(
    {
      message: 'Contact form submitted successfully',
      success: true,
    },
    { status: 200 }
  )
}
