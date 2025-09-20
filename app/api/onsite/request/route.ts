import { NextRequest, NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { IncomingMessage } from 'http'

import { LRUCache } from 'lru-cache'

import { OWNER_TIMEZONE } from 'config'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import sendMail from 'lib/email'
import OnSiteRequestEmail from 'lib/messaging/email/admin/OnSiteRequestEmail'
import ClientRequestEmail from 'lib/messaging/email/client/ClientRequestEmail'
import { getHash } from 'lib/hash'
import type { DateTimeIntervalWithTimezone } from 'lib/types'
import { OnSiteRequestSchema } from 'lib/schema'
import siteMetadata from '@/data/siteMetadata'
import { intervalToHumanString } from 'lib/intervalToHumanString'

// Define the rate limiter
const rateLimitLRU = new LRUCache({
  max: 500,
  ttl: 60_000, // 60_000 milliseconds = 1 minute
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 5

// Define the schema for the request body

export async function POST(req: NextRequest & IncomingMessage): Promise<NextResponse> {
  const headers = await nextHeaders()
  const jsonData = await req.json()

  // Apply rate limiting using the client's IP address
  const limitReached = checkRateLimit()

  if (limitReached) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Validate and parse the request body using Zod
  const validationResult = OnSiteRequestSchema.safeParse(jsonData)

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error.message, { status: 400 })
  }
  const { data } = validationResult

  const start = new Date(data.start)
  const end = new Date(data.end)

  const approveUrl = `${headers.get('origin') ?? '?'}/api/onsite/confirm/?data=${encodeURIComponent(
    JSON.stringify(data)
  )}&key=${getHash(JSON.stringify(data))}`

  // Transform pricing to match expected type
  const transformedPricing = data.pricing
    ? Object.fromEntries(
        Object.entries(data.pricing).map(([key, value]) => [Number(key), Number(value)])
      )
    : undefined

  // Generate and send the approval email
  const approveEmail = OnSiteRequestEmail({
    ...data,
    location: data.locationObject || { street: '', city: data.locationString || '', zip: '' },
    pricing: transformedPricing,
    approveUrl,
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: OWNER_TIMEZONE,
    }),
  })

  const emailData = {
    to: siteMetadata.email ?? '',
    subject: approveEmail.subject,
    body: approveEmail.body,
    data,
    approveUrl,
  }

  await sendMail({
    to: siteMetadata.email ?? '',
    subject: approveEmail.subject,
    body: approveEmail.body,
  })

  // Generate and send the confirmation email
  const confirmationEmail = await ClientRequestEmail({
    ...data,
    location: data.locationObject || { street: '', city: data.locationString || '', zip: '' },
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: data.timeZone,
    }),
  })
  await sendMail({
    to: data.email,
    subject: confirmationEmail.subject,
    body: confirmationEmail.body,
  })

  return NextResponse.json({ success: true }, { status: 200 })

  /**
   * Checks the rate limit for the current IP address.
   *
   * @return {boolean} Whether the rate limit has been reached.
   */
  function checkRateLimit(): boolean {
    const forwarded = headers.get('x-forwarded-for')
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded) ??
      req.socket.remoteAddress ??
      '127.0.0.1'

    const tokenCount = (rateLimitLRU.get(ip) as number[]) || [0]
    if (tokenCount[0] === 0) {
      rateLimitLRU.set(ip, tokenCount)
    }
    tokenCount[0] += 1
    const currentUsage = tokenCount[0]
    return currentUsage >= REQUESTS_PER_IP_PER_MINUTE_LIMIT
  }
}
