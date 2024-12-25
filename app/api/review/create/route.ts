import { NextRequest, NextResponse } from "next/server"
import { headers as nextHeaders } from "next/headers"
import { IncomingMessage } from "http"

import LRUCache from "lru-cache"
import { z } from "zod"
import sendMail from "@/lib/email"
import ReviewSubmissionEmail from "@/lib/email/messages/ReviewSubmissionEmail"
import { RatingTypeStrict } from "@/components/ReviewForm"

// Define the rate limiter
const rateLimitLRU = new LRUCache({
  max: 500,
  ttl: 60_000, // 60_000 milliseconds = 1 minute
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 5

// Define the schema for the request body
const CreateReviewSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  text: z.string(),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Start must be a valid date.",
  }),
  rating: z.union([z.number(), z.string()]).refine(
    (value) => {
      let parsedValue
      if (typeof value === "string") {
        parsedValue = Number.parseInt(value)
      } else {
        parsedValue = value
      }
      return !Number.isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 5
    },
    {
      message: "Rating must be a valid integer 1 - 5.",
    }
  ),
  price: z
    .string()
    .refine((value) => !Number.isNaN(Number.parseInt(value)), {
      message: "Rating must be a valid integer 1 - 5.",
    })
    .optional(),
  source: z.string(),
  type: z.string(),
  dateSummary: z.string().optional(),
})

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
  const validationResult = CreateReviewSchema.safeParse(jsonData)

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error.message, {
      status: 400,
    })
  }

  const { data } = validationResult

  // Generate and send the approval email
  const createReviewEmail = ReviewSubmissionEmail({
    ...data,
    rating: data.rating as RatingTypeStrict,
  })
  await sendMail({
    to: process.env.OWNER_EMAIL ?? "",
    subject: createReviewEmail.subject,
    body: createReviewEmail.body,
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
