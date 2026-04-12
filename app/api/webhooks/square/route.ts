import { NextResponse, type NextRequest } from 'next/server'
import { WebhooksHelper } from 'square'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/square/invoice'

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

  const event = JSON.parse(body)
  await processWebhookEvent(event)

  return new NextResponse('OK', { status: 200 })
}

interface SquareWebhookEvent {
  type: string
  event_id: string
  data: {
    type: string
    id: string
    object: {
      invoice?: {
        id: string
        order_id: string
        status: string
        version: number
        payment_requests?: Array<{
          computed_amount_money?: { amount: number }
        }>
      }
    }
  }
}

async function processWebhookEvent(event: SquareWebhookEvent) {
  const eventType = event.type
  const invoice = event.data?.object?.invoice

  if (!invoice) return

  const supabase = getSupabaseAdminClient()
  if (!supabase) return

  const { data: localInvoice } = await supabase
    .from('invoices')
    .select('id, booking_id, status')
    .eq('square_invoice_id', invoice.id)
    .single()

  if (!localInvoice) {
    console.warn(`Webhook for unknown invoice: ${invoice.id}`)
    return
  }

  const statusBefore = localInvoice.status
  const statusAfter = invoice.status

  const updateData: Record<string, string | null> = {
    status: statusAfter,
  }

  if (statusAfter === 'PAID') {
    updateData.paid_at = new Date().toISOString()
  } else if (statusAfter === 'CANCELED') {
    updateData.canceled_at = new Date().toISOString()
  }

  await supabase.from('invoices').update(updateData).eq('id', localInvoice.id)

  await writeAuditLog({
    bookingId: localInvoice.booking_id,
    squareInvoiceId: invoice.id,
    squareOrderId: invoice.order_id,
    eventType: mapWebhookEventType(eventType),
    eventSource: 'webhook',
    statusBefore,
    statusAfter,
    payload: { squareEventId: event.event_id, rawType: eventType },
    idempotencyKey: event.event_id,
  })
}

function mapWebhookEventType(squareEventType: string): string {
  const mapping: Record<string, string> = {
    'invoice.payment_made': 'invoice.payment_made',
    'invoice.updated': 'invoice.updated',
    'invoice.published': 'invoice.published',
    'invoice.scheduled_charge_failed': 'invoice.scheduled_charge_failed',
    'invoice.canceled': 'invoice.canceled',
    'invoice.refunded': 'invoice.refunded',
  }
  return mapping[squareEventType] ?? squareEventType
}
