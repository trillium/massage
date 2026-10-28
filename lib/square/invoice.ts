import type { Currency } from 'square'
import { getSquareClient, getSquareLocationId } from './client'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'

interface BookingData {
  bookingId: string
  clientEmail: string
  clientFirstName: string
  clientLastName: string
  serviceName: string
  amountCents: number
  currency: string
  dueDate: string
}

interface InvoiceResult {
  invoiceId: string
  invoiceUrl: string
  invoiceNumber: string
  status: string
  version: number
  orderId: string
  customerId: string
}

export async function createAndPublishInvoice(
  booking: BookingData,
  idempotencyKey: string
): Promise<InvoiceResult> {
  const client = getSquareClient()
  const locationId = getSquareLocationId()

  const customerId = await upsertSquareCustomer(client, booking)

  const orderId = await createSquareOrder(client, locationId, booking, `${idempotencyKey}:order`)

  const { invoiceId, version } = await createSquareDraftInvoice(
    client,
    locationId,
    orderId,
    customerId,
    booking,
    `${idempotencyKey}:invoice`
  )

  const published = await publishSquareInvoice(
    client,
    invoiceId,
    version,
    `${idempotencyKey}:publish`
  )

  return {
    invoiceId: published.invoiceId,
    invoiceUrl: published.publicUrl,
    invoiceNumber: published.invoiceNumber,
    status: published.status,
    version: published.version,
    orderId,
    customerId,
  }
}

async function upsertSquareCustomer(
  client: ReturnType<typeof getSquareClient>,
  booking: BookingData
): Promise<string> {
  const searchResult = await client.customers.search({
    query: {
      filter: {
        emailAddress: { exact: booking.clientEmail },
      },
    },
  })

  if (searchResult.customers && searchResult.customers.length > 0) {
    return searchResult.customers[0].id!
  }

  const createResult = await client.customers.create({
    emailAddress: booking.clientEmail,
    givenName: booking.clientFirstName,
    familyName: booking.clientLastName,
  })

  return createResult.customer!.id!
}

async function createSquareOrder(
  client: ReturnType<typeof getSquareClient>,
  locationId: string,
  booking: BookingData,
  idempotencyKey: string
): Promise<string> {
  const result = await client.orders.create({
    idempotencyKey,
    order: {
      locationId,
      lineItems: [
        {
          name: booking.serviceName,
          quantity: '1',
          basePriceMoney: {
            amount: BigInt(booking.amountCents),
            currency: booking.currency as Currency,
          },
        },
      ],
      referenceId: booking.bookingId,
    },
  })

  return result.order!.id!
}

async function createSquareDraftInvoice(
  client: ReturnType<typeof getSquareClient>,
  locationId: string,
  orderId: string,
  customerId: string,
  booking: BookingData,
  idempotencyKey: string
): Promise<{ invoiceId: string; version: number }> {
  const result = await client.invoices.create({
    idempotencyKey,
    invoice: {
      locationId,
      orderId,
      primaryRecipient: { customerId },
      deliveryMethod: 'EMAIL',
      paymentRequests: [
        {
          requestType: 'BALANCE',
          dueDate: booking.dueDate,
          automaticPaymentSource: 'NONE',
        },
      ],
      acceptedPaymentMethods: { card: true },
      title: booking.serviceName,
    },
  })

  return {
    invoiceId: result.invoice!.id!,
    version: result.invoice!.version!,
  }
}

async function publishSquareInvoice(
  client: ReturnType<typeof getSquareClient>,
  invoiceId: string,
  version: number,
  idempotencyKey: string
): Promise<{
  invoiceId: string
  publicUrl: string
  invoiceNumber: string
  status: string
  version: number
}> {
  const result = await client.invoices.publish({
    invoiceId,
    idempotencyKey,
    version,
  })

  const invoice = result.invoice!
  return {
    invoiceId: invoice.id!,
    publicUrl: invoice.publicUrl!,
    invoiceNumber: invoice.invoiceNumber!,
    status: invoice.status!,
    version: invoice.version ?? 0,
  }
}

export async function writeInvoiceRecord(
  bookingId: string,
  result: InvoiceResult,
  emailSentTo: string,
  amountCents: number,
  currency: string
) {
  const supabase = getSupabaseAdminClient()
  if (!supabase) throw new Error('Supabase admin client unavailable')

  const { error } = await supabase.from('invoices').insert({
    booking_id: bookingId,
    square_invoice_id: result.invoiceId,
    square_order_id: result.orderId,
    square_customer_id: result.customerId,
    status: result.status as 'UNPAID',
    square_version: result.version,
    public_url: result.invoiceUrl,
    invoice_number: result.invoiceNumber,
    amount_cents: amountCents,
    currency,
    email_sent_to: emailSentTo,
  })

  if (!error) return

  // Retry after a crash: the row may already exist for this exact Square invoice.
  if (error.code === '23505') {
    const { data: existing } = await supabase
      .from('invoices')
      .select('square_invoice_id')
      .eq('booking_id', bookingId)
      .maybeSingle()
    if (existing?.square_invoice_id === result.invoiceId) return
  }
  throw new Error(`Failed to write invoice record: ${error.message}`)
}

/**
 * Returns the idempotency key to use for Square calls for this booking.
 * The first key seen is persisted (audit log, unique per key), and every retry
 * reuses it, so a retry after a crash reconciles with the already-created
 * Square order/invoice instead of publishing a second invoice.
 */
export async function resolveCreateIdempotencyKey(
  bookingId: string,
  requestedKey: string
): Promise<string> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) throw new Error('Supabase admin client unavailable')

  const lookup = async () => {
    const { data, error } = await supabase
      .from('invoice_audit_log')
      .select('payload')
      .eq('booking_id', bookingId)
      .eq('event_type', 'invoice.create_started')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(`Failed to read invoice create key: ${error.message}`)
    const key = (data?.payload as { squareIdempotencyKey?: string } | null)?.squareIdempotencyKey
    return key ?? null
  }

  const existing = await lookup()
  if (existing) return existing

  const { error } = await supabase.from('invoice_audit_log').insert({
    booking_id: bookingId,
    event_type: 'invoice.create_started',
    event_source: 'api',
    payload: { squareIdempotencyKey: requestedKey } as unknown as Json,
    idempotency_key: `${requestedKey}:started`,
  })
  if (error && error.code !== '23505') {
    throw new Error(`Failed to persist invoice create key: ${error.message}`)
  }
  // On a race the winner's key is the stored one.
  return (await lookup()) ?? requestedKey
}

export async function writeAuditLog(entry: {
  bookingId: string
  squareInvoiceId?: string
  squareOrderId?: string
  eventType: string
  eventSource: string
  statusBefore?: string
  statusAfter?: string
  payload?: Record<string, unknown>
  errorDetail?: Record<string, unknown>
  idempotencyKey?: string
}) {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return

  const { error } = await supabase.from('invoice_audit_log').insert({
    booking_id: entry.bookingId,
    square_invoice_id: entry.squareInvoiceId,
    square_order_id: entry.squareOrderId,
    event_type: entry.eventType,
    event_source: entry.eventSource,
    status_before: entry.statusBefore,
    status_after: entry.statusAfter,
    payload: entry.payload as unknown as Json,
    error_detail: entry.errorDetail as unknown as Json,
    idempotency_key: entry.idempotencyKey,
  })
  // 23505 = duplicate idempotency_key: the entry was already recorded.
  if (error && error.code !== '23505') {
    console.error(`Failed to write invoice audit log (${entry.eventType}):`, error.message)
  }
}
