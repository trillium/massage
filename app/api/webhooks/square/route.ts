import { NextResponse, type NextRequest } from 'next/server'
import { WebhooksHelper } from 'square'
import { processWebhookEvent, type SquareWebhookEvent } from '@/lib/square/webhookEvents'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-square-hmacsha256-signature')

  if (!signature) {
    return new NextResponse('Missing signature', { status: 401 })
  }

  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  const notificationUrl = process.env.SQUARE_WEBHOOK_URL

  if (!signatureKey || !notificationUrl) {
    console.error('Square webhook configuration missing')
    return new NextResponse('Server misconfigured', { status: 500 })
  }

  const isValid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: signature,
    signatureKey,
    notificationUrl,
  })

  if (!isValid) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  const event = parseEvent(body)
  if (!event) return new NextResponse('Malformed event', { status: 400 })

  try {
    const outcome = await processWebhookEvent(event)
    return new NextResponse(outcome, { status: 200 })
  } catch (error) {
    // Non-2xx makes Square redeliver; the inbox + version guard keep that safe.
    console.error('Square webhook processing failed:', error)
    return new NextResponse('Processing failed', { status: 500 })
  }
}

function parseEvent(body: string): SquareWebhookEvent | null {
  try {
    const event = JSON.parse(body)
    return typeof event?.event_id === 'string' && event.event_id ? event : null
  } catch {
    return null
  }
}
