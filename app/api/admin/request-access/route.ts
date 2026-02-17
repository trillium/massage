import { NextRequest, NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { LRUCache } from 'lru-cache'
import sendMail from '@/lib/email'
import siteMetadata from '@/data/siteMetadata'
import { AdminAccessRequestSchema } from '@/lib/schema'
import AdminAccessEmail from '@/lib/messaging/email/admin/AdminAccessEmail'
import { escapeHtml } from '@/lib/messaging/escapeHtml'
import { getOriginFromHeaders } from '@/lib/helpers/getOriginFromHeaders'

// Rate limiting
const rateLimitLRU = new LRUCache({
  max: 100,
  ttl: 60_000, // 1 minute
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 2 // Very restrictive for admin access

/**
 * Request admin access - sends secure admin link via email
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const headers = await nextHeaders()

  try {
    // Rate limiting
    const limitReached = checkRateLimit(headers)
    if (limitReached) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before requesting again.' },
        { status: 429 }
      )
    }

    // Parse and validate request
    const jsonData = await req.json()
    const validationResult = AdminAccessRequestSchema.safeParse(jsonData)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const { email, requestReason } = validationResult.data

    // Only allow specific admin email(s) - configure in your environment
    const allowedAdminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim())

    if (!allowedAdminEmails.includes(email)) {
      // Log the attempt but don't reveal this information
      console.warn(`Unauthorized admin access attempt for email: ${email}`)

      // Return success to avoid revealing valid/invalid emails
      return NextResponse.json(
        { success: true, message: 'If this email is authorized, an admin link has been sent.' },
        { status: 200 }
      )
    }

    // Generate login link
    const baseUrl = getOriginFromHeaders(headers)
    const adminLink = `${baseUrl}/auth/login`

    // Create email content using template
    const { subject: emailSubject, body: emailBody } = AdminAccessEmail({
      email: escapeHtml(email),
      requestReason: escapeHtml(requestReason),
      adminLink,
      requestTime: new Date().toLocaleString(),
    })

    // Send email
    await sendMail({
      to: email,
      subject: emailSubject,
      body: emailBody,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Admin access link has been sent to your email. Please check your inbox.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing admin access request:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

/**
 * Rate limiting helper
 */
function checkRateLimit(headers: Headers): boolean {
  const forwarded = headers.get('x-forwarded-for')
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || '127.0.0.1'

  const tokenCount = (rateLimitLRU.get(ip) as number) || 0
  const newCount = tokenCount + 1

  rateLimitLRU.set(ip, newCount)

  return newCount > REQUESTS_PER_IP_PER_MINUTE_LIMIT
}
