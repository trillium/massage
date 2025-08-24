import { NextRequest, NextResponse } from 'next/server'
import { handleContactRequest } from '@/lib/handleContactRequest'
import { ContactFormSchema } from '@/lib/schema'
import sendMail from '@/lib/email'
import siteMetadata from '@/data/siteMetadata'
import { LRUCache } from 'lru-cache'
import { checkRateLimitFactory } from '@/lib/checkRateLimitFactory'

// Define the rate limiter
const rateLimitLRU = new LRUCache({
  max: 500,
  ttl: 60_000, // 60_000 milliseconds = 1 minute
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 3 // Lower limit for contact forms

export async function POST(request: NextRequest) {
  try {
    return await handleContactRequest({
      req: request,
      headers: request.headers,
      sendMailFn: sendMail,
      siteMetadata,
      rateLimiter: checkRateLimitFactory(rateLimitLRU, REQUESTS_PER_IP_PER_MINUTE_LIMIT),
      schema: ContactFormSchema,
    })
  } catch (error) {
    console.error('Error in contact API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
