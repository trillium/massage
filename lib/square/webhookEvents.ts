import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'
import { writeAuditLog } from './invoiceRecords'

export interface SquareWebhookEvent {
  type: string
  event_id: string
  created_at?: string
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

const UNKNOWN_INVOICE_RETRY_WINDOW_MS = 10 * 60 * 1000

function isWithinRetryWindow(event: SquareWebhookEvent): boolean {
  const createdAt = Date.parse(event.created_at ?? '')
  return Number.isNaN(createdAt) || Date.now() - createdAt < UNKNOWN_INVOICE_RETRY_WINDOW_MS
}

export async function processWebhookEvent(event: SquareWebhookEvent): Promise<string> {
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

type AdminClient = NonNullable<ReturnType<typeof getSupabaseAdminClient>>

function buildUpdate(invoice: { status: string; version: number }) {
  const update: Record<string, string | number | null> = {
    status: invoice.status,
    square_version: invoice.version,
  }
  if (invoice.status === 'PAID') update.paid_at = new Date().toISOString()
  if (invoice.status === 'CANCELED') update.canceled_at = new Date().toISOString()
  return update
}

async function findLocalInvoice(supabase: AdminClient, squareInvoiceId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, booking_id, status, square_version')
    .eq('square_invoice_id', squareInvoiceId)
    .maybeSingle()
  if (error) throw new Error(`Invoice lookup failed: ${error.message}`)
  return data
}

/** Applies the update only if strictly newer than stored (Square delivers out of order). */
async function updateIfNewer(
  supabase: AdminClient,
  id: string,
  invoice: { status: string; version: number }
): Promise<boolean> {
  const { data, error } = await supabase
    .from('invoices')
    .update(buildUpdate(invoice))
    .eq('id', id)
    .or(`square_version.is.null,square_version.lt.${invoice.version}`)
    .select('id')
  if (error) throw new Error(`Invoice update failed: ${error.message}`)
  return (data?.length ?? 0) > 0
}

async function applyInvoiceEvent(
  supabase: AdminClient,
  event: SquareWebhookEvent
): Promise<string> {
  const invoice = event.data?.object?.invoice
  if (!invoice) return 'Ignored'

  const local = await findLocalInvoice(supabase, invoice.id)
  if (!local) {
    if (isWithinRetryWindow(event)) {
      throw new Error(`Webhook for unknown invoice: ${invoice.id}`)
    }
    console.warn(`Ignoring webhook ${event.event_id} for unknown invoice ${invoice.id}`)
    return 'Ignored'
  }
  const applied = await updateIfNewer(supabase, local.id, invoice)

  await writeAuditLog({
    bookingId: local.booking_id,
    squareInvoiceId: invoice.id,
    squareOrderId: invoice.order_id,
    eventType: event.type,
    eventSource: 'webhook',
    statusBefore: local.status,
    statusAfter: applied ? invoice.status : local.status,
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
