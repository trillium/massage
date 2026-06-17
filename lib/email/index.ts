import type { SendMailParams } from '@/lib/types'
import siteMetadata from '@/data/siteMetadata'
import getGmailAccessToken from '@/lib/gmail/getGmailAccessToken'
import { logEmailSend } from '@/lib/db/auditLog'

function encodeSubject(subject: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional ASCII range check
  if (/^[\x00-\x7F]*$/.test(subject)) return subject
  return `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`
}

function buildRawMessage({
  from,
  fromName,
  to,
  subject,
  html,
}: {
  from: string
  fromName: string
  to: string
  subject: string
  html: string
}): string {
  const message = [
    `From: ${fromName} <${from}>`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
  ].join('\r\n')

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function sendMail({ to, subject, body, template, variables }: SendMailParams): Promise<void> {
  const accessToken = await getGmailAccessToken()

  const raw = buildRawMessage({
    from: siteMetadata.email,
    fromName: process.env.NEXT_PUBLIC_OWNER_NAME ?? siteMetadata.email,
    to,
    subject,
    html: body,
  })

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    })

    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`Gmail API error ${res.status}: ${detail}`)
    }

    if (template) {
      logEmailSend({ template, to_address: to, subject, variables, send_state: 'success' }).catch(
        () => {}
      )
    }
  } catch (err) {
    if (template) {
      logEmailSend({
        template,
        to_address: to,
        subject,
        variables,
        send_state: 'failed',
        error_detail: err instanceof Error ? err.message : String(err),
      }).catch(() => {})
    }
    throw err
  }
}

export default sendMail
