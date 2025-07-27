import { NextRequest, NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { IncomingMessage } from 'http'

import { LRUCache } from 'lru-cache'
import { z } from 'zod'

import { OWNER_TIMEZONE } from 'config'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import sendMail from 'lib/email'
import ApprovalEmail from 'lib/email/messages/Approval'
import ClientRequestEmail from 'lib/email/messages/ClientRequestEmail'
import { getHash } from 'lib/hash'
import type { DateTimeIntervalWithTimezone } from 'lib/types'
import { AppointmentRequestSchema } from 'lib/schema'
import siteMetadata from '@/data/siteMetadata'
import { intervalToHumanString } from 'lib/intervalToHumanString'

// Define the rate limiter
const rateLimitLRU = new LRUCache({
  max: 500,
  ttl: 60_000, // 60_000 milliseconds = 1 minute
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 5

// Define the schema for the request body

// Extracted pure logic for testability
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

// Pure rate limiter for injection
export function checkRateLimitFactory(lru: typeof rateLimitLRU, limit: number) {
  return (req: NextRequest & IncomingMessage, headers: Headers) => {
    const forwarded = headers.get('x-forwarded-for')
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded) ??
      req.socket.remoteAddress ??
      '127.0.0.1'
    const tokenCount = (lru.get(ip) as number[]) || [0]
    if (tokenCount[0] === 0) {
      lru.set(ip, tokenCount)
    }
    tokenCount[0] += 1
    const currentUsage = tokenCount[0]
    return currentUsage >= limit
  }
}

// The actual route handler, now just wiring dependencies
export async function POST(req: NextRequest & IncomingMessage): Promise<NextResponse> {
  const headers = await nextHeaders()
  return handleAppointmentRequest({
    req,
    headers,
    sendMailFn: sendMail,
    siteMetadata,
    ownerTimeZone: OWNER_TIMEZONE,
    approvalEmailFn: ApprovalEmail,
    clientRequestEmailFn: ClientRequestEmail,
    getHashFn: getHash,
    rateLimiter: checkRateLimitFactory(rateLimitLRU, REQUESTS_PER_IP_PER_MINUTE_LIMIT),
    appointmentRequestSchema: AppointmentRequestSchema,
  })
}
