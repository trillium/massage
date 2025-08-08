import { NextRequest, NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { IncomingMessage } from 'http'

import { LRUCache } from 'lru-cache'
import { z } from 'zod'

import { OWNER_TIMEZONE } from 'config'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import sendMail from 'lib/email'
import { ApprovalEmail } from 'lib/email/messages/Approval'
import ClientRequestEmail from 'lib/email/messages/ClientRequestEmail'
import { getHash } from 'lib/hash'
import type { DateTimeIntervalWithTimezone } from 'lib/types'
import { AppointmentRequestSchema } from 'lib/schema'
import siteMetadata from '@/data/siteMetadata'
import { intervalToHumanString } from 'lib/intervalToHumanString'
import { handleAppointmentRequest } from 'lib/handleAppointmentRequest'
import { checkRateLimitFactory } from 'lib/checkRateLimitFactory'

// Define the rate limiter
const rateLimitLRU = new LRUCache({
  max: 500,
  ttl: 60_000, // 60_000 milliseconds = 1 minute
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 5

// The actual route handler, now just wiring dependencies
export async function POST(req: NextRequest & IncomingMessage): Promise<NextResponse> {
  console.log(req)
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
    schema: AppointmentRequestSchema,
  })
}
