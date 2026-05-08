import { NextRequest, NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'

import sendMail from 'lib/email'
import ReviewSubmissionEmail from 'lib/messaging/email/admin/ReviewSubmissionEmail'
import siteMetadata from '@/data/siteMetadata'
import { RatingTypeStrict } from '@/lib/types'
import { escapeHtml } from 'lib/messaging/escapeHtml'
import { CreateReviewSchema } from '@/lib/schema'
import { createRateLimiter, rateLimitResponse } from '@/lib/api/rateLimit'

const checkRateLimit = createRateLimiter()

export async function POST(req: NextRequest): Promise<NextResponse> {
  const headers = await nextHeaders()

  if (checkRateLimit(req, headers)) {
    return rateLimitResponse()
  }

  const jsonData = await req.json()
  const validationResult = CreateReviewSchema.safeParse(jsonData)

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error.message, { status: 400 })
  }

  const { data } = validationResult

  const safeData = {
    firstName: escapeHtml(data.firstName),
    lastName: escapeHtml(data.lastName),
    text: escapeHtml(data.text),
    source: escapeHtml(data.source),
    type: escapeHtml(data.type),
  }

  const createReviewEmail = ReviewSubmissionEmail({
    ...data,
    ...safeData,
    rating: data.rating as RatingTypeStrict,
  })
  await sendMail({
    to: siteMetadata.email ?? '',
    subject: createReviewEmail.subject,
    body: createReviewEmail.body,
  })

  return NextResponse.json({ success: true }, { status: 200 })
}
