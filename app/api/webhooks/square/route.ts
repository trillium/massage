import { NextResponse, type NextRequest } from 'next/server'
import { WebhooksHelper } from 'square'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'
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

  let event: SquareWebhookEvent
  try {
    event = JSON.parse(body)
  } catch {
    return new NextResponse('Malformed JSON', { status: 400 })
  }
  if (
    !event ||
    typeof event !== 'object' ||
    typeof event.event_id !== 'string' ||
    !event.event_id
  ) {
    return new NextResponse('Malformed event', { status: 400 })
  }

  try {
    const outcome = await processWebhookEvent(event)
    return new NextResponse(outcome, { status: 200 })
  } catch (error) {
    // Non-2xx makes Square redeliver; the inbox + version guard keep that safe.
    console.error('Square webhook processing failed:', error)
    return new NextResponse('Processing failed', { status: 500 })
  }
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

async function processWebhookEvent(event: SquareWebhookEvent): Promise<string> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) throw new Error('Supabase admin client unavailable')

  // Inbox: claim the event id. A processed duplicate is acknowledged untouched;
  // an unprocessed one (earlier attempt failed midway) is retried.
  const { error: claimError } = await supabase.from('square_webhook_events').insert({
    event_id: event.event_id,
    event_type: event.type,
    payload: event as unknown as Json,
  })
  if (claimError) {
    if (claimError.code !== '23505') {
      throw new Error(`Failed to record webhook event: ${claimError.message}`)
    }
    const { data: existing, error: readError } = await supabase
      .from('square_webhook_events')
      .select('processed_at')
      .eq('event_id', event.event_id)
      .maybeSingle()
    if (readError) throw new Error(`Failed to read webhook event: ${readError.message}`)
    if (existing?.processed_at) return 'Duplicate'
  }

  const outcome = await applyInvoiceEvent(supabase, event)

  const { error: doneError } = await supabase
    .from('square_webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('event_id', event.event_id)
  if (doneError) throw new Error(`Failed to mark webhook processed: ${doneError.message}`)

  return outcome
}

async function applyInvoiceEvent(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  event: SquareWebhookEvent
): Promise<string> {
  const invoice = event.data?.object?.invoice
  if (!invoice) return 'Ignored'

  const { data: localInvoice, error: lookupError } = await supabase
    .from('invoices')
    .select('id, booking_id, status, square_version')
    .eq('square_invoice_id', invoice.id)
    .maybeSingle()
  if (lookupError) throw new Error(`Invoice lookup failed: ${lookupError.message}`)

  if (!localInvoice) {
    // May simply be ahead of the local insert (create path is not atomic):
    // fail so Square redelivers; the event stays unprocessed in the inbox.
    throw new Error(`Webhook for unknown invoice: ${invoice.id}`)
  }

  const statusBefore = localInvoice.status
  const statusAfter = invoice.status

  const updateData: Record<string, string | number | null> = {
    status: statusAfter,
    square_version: invoice.version,
  }
  if (statusAfter === 'PAID') {
    updateData.paid_at = new Date().toISOString()
  } else if (statusAfter === 'CANCELED') {
    updateData.canceled_at = new Date().toISOString()
  }

  // Apply only if strictly newer than what is stored (Square delivers out of order).
  const { data: updated, error: updateError } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', localInvoice.id)
    .or(`square_version.is.null,square_version.lt.${invoice.version}`)
    .select('id')
  if (updateError) throw new Error(`Invoice update failed: ${updateError.message}`)

  const applied = (updated?.length ?? 0) > 0

  await writeAuditLog({
    bookingId: localInvoice.booking_id,
    squareInvoiceId: invoice.id,
    squareOrderId: invoice.order_id,
    eventType: mapWebhookEventType(event.type),
    eventSource: 'webhook',
    statusBefore,
    statusAfter: applied ? statusAfter : statusBefore,
    payload: {
      squareEventId: event.event_id,
      rawType: event.type,
      squareVersion: invoice.version,
      applied,
    },
    idempotencyKey: event.event_id,
  })

  return applied ? 'OK' : 'Stale'
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
