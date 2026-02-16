import { NextRequest, NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { IncomingMessage } from 'http'

import { LRUCache } from 'lru-cache'
import { z } from 'zod'

import { OWNER_TIMEZONE } from 'config'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import sendMail from 'lib/email'
import { ApprovalEmail } from 'lib/messaging/email/admin/Approval'
import ClientRequestEmail from 'lib/messaging/email/client/ClientRequestEmail'
import ClientConfirmEmail from 'lib/messaging/email/client/ClientConfirmEmail'
import { getHash } from 'lib/hash'
import type { DateTimeIntervalWithTimezone } from 'lib/types'
import { AppointmentRequestSchema } from 'lib/schema'
import siteMetadata from '@/data/siteMetadata'
import { intervalToHumanString } from 'lib/intervalToHumanString'
import { handleAppointmentRequest } from 'lib/handleAppointmentRequest'
import { checkRateLimitFactory } from 'lib/checkRateLimitFactory'
import createRequestCalendarEvent from 'lib/availability/createRequestCalendarEvent'
import updateCalendarEvent from 'lib/availability/updateCalendarEvent'

// Define the rate limiter
const rateLimitLRU = new LRUCache({
  max: 500,
  ttl: 60_000, // 60_000 milliseconds = 1 minute
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 5

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
    clientConfirmEmailFn: ClientConfirmEmail,
    getHashFn: getHash,
    rateLimiter: checkRateLimitFactory(rateLimitLRU, REQUESTS_PER_IP_PER_MINUTE_LIMIT),
    schema: AppointmentRequestSchema,
    createRequestCalendarEvent,
    updateCalendarEvent,
  })
}
