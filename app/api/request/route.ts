import { NextRequest, NextResponse } from "next/server"
import { headers as nextHeaders } from "next/headers"
import { IncomingMessage } from "http"

import LRUCache from "lru-cache"
import { z } from "zod"

import { OWNER_TIMEZONE } from "@/config"
import { formatLocalDate, formatLocalTime } from "@/lib/availability/helpers"
import sendMail from "@/lib/email"
import ApprovalEmail from "@/lib/email/messages/Approval"
import ClientRequestEmail from "@/lib/email/messages/ClientRequestEmail"
import { getHash } from "@/lib/hash"
import type { DateTimeIntervalWithTimezone } from "@/lib/types"
import { AppointmentRequestSchema } from "@/lib/schema"

// Define the rate limiter
const rateLimitLRU = new LRUCache({
  max: 500,
  ttl: 60_000, // 60_000 milliseconds = 1 minute
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 5

// Define the schema for the request body

export async function POST(
  req: NextRequest & IncomingMessage
): Promise<NextResponse> {
  const headers = nextHeaders()
  const jsonData = await req.json()
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
  }

  // Apply rate limiting using the client's IP address
  const limitReached = checkRateLimit()

  if (limitReached) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  // Validate and parse the request body using Zod
  const validationResult = AppointmentRequestSchema.safeParse(jsonData)

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error.message, { status: 400 })
  }
  const { data } = validationResult

  const start = new Date(data.start)
  const end = new Date(data.end)

  const approveUrl = `${
    headers.get("origin") ?? "?"
  }/api/confirm/?data=${encodeURIComponent(JSON.stringify(data))}&key=${getHash(
    JSON.stringify(data)
  )}`

  // Generate and send the approval email
  const approveEmail = ApprovalEmail({
    ...data,
    approveUrl,
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: OWNER_TIMEZONE,
    }),
  })
  await sendMail({
    to: process.env.OWNER_EMAIL ?? "",
    subject: approveEmail.subject,
    body: approveEmail.body,
  })

  // Generate and send the confirmation email
  const confirmationEmail = ClientRequestEmail({
    ...data,
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
    const forwarded = headers.get("x-forwarded-for")
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded) ??
      req.socket.remoteAddress ??
      "127.0.0.1"

    const tokenCount = (rateLimitLRU.get(ip) as number[]) || [0]
    if (tokenCount[0] === 0) {
      rateLimitLRU.set(ip, tokenCount)
    }
    tokenCount[0] += 1
    const currentUsage = tokenCount[0]
    return currentUsage >= REQUESTS_PER_IP_PER_MINUTE_LIMIT
  }
}

/**
 * Converts a date-time interval to a human-readable string.
 *
 * This function takes a date-time interval with start and end times,
 * and a time zone.
 *
 * It returns a formatted string representing the interval, including
 * the start and end times, and the time zone.
 *
 * @function
 * @param {Object} DateTimeIntervalWithTimezone An object containing the
 * start, end, and time zone of the interval.
 *
 * @param {string} interval.start The start time of the interval
 * as a string or Date object.
 *
 * @param {string} interval.end The end time of the interval as
 * a string or Date object.
 *
 * @param {string} interval.timeZone The time zone used to format
 * the date and time.
 *
 * @returns {string} A human-readable string representation
 * of the date-time interval.
 */
function intervalToHumanString({
  start,
  end,
  timeZone,
}: DateTimeIntervalWithTimezone): string {
  return `${formatLocalDate(start, {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    weekday: "long",
    timeZone,
  })} – ${formatLocalTime(end, {
    hour: "numeric",
    minute: "numeric",
    timeZone,
    timeZoneName: "longGeneric",
  })}`
}
