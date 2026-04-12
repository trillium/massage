import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { createAndPublishInvoice, writeInvoiceRecord, writeAuditLog } from '@/lib/square/invoice'

const CreateInvoiceSchema = z.object({
  bookingId: z.string().uuid(),
  idempotencyKey: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CreateInvoiceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { bookingId, idempotencyKey } = parsed.data
  const supabase = getSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ error: 'SERVER_MISCONFIGURED' }, { status: 500 })

  const { data: booking, error: bookingError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'BOOKING_NOT_FOUND' }, { status: 400 })
  }

  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('id, square_invoice_id, public_url, invoice_number, status')
    .eq('booking_id', bookingId)
    .single()

  if (existingInvoice && existingInvoice.status !== 'DRAFT') {
    return NextResponse.json(
      {
        error: 'BOOKING_ALREADY_INVOICED',
        invoice: {
          invoiceId: existingInvoice.square_invoice_id,
          invoiceUrl: existingInvoice.public_url,
          invoiceNumber: existingInvoice.invoice_number,
          status: existingInvoice.status,
        },
      },
      { status: 400 }
    )
  }

  if (!booking.client_email) {
    return NextResponse.json({ error: 'CUSTOMER_MISSING_EMAIL' }, { status: 400 })
  }

  const amountCents = booking.price ?? 0
  if (amountCents <= 0) {
    return NextResponse.json({ error: 'INVALID_AMOUNT' }, { status: 400 })
  }

  const dueDate = booking.start_time
    ? new Date(booking.start_time).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const serviceName = buildServiceName(booking.duration_minutes, booking.slug_config)

  try {
    const result = await createAndPublishInvoice(
      {
        bookingId,
        clientEmail: booking.client_email,
        clientFirstName: booking.client_first_name,
        clientLastName: booking.client_last_name,
        serviceName,
        amountCents,
        currency: 'USD',
        dueDate,
      },
      idempotencyKey
    )

    await writeInvoiceRecord(bookingId, result, booking.client_email, amountCents, 'USD')

    await writeAuditLog({
      bookingId,
      squareInvoiceId: result.invoiceId,
      squareOrderId: result.orderId,
      eventType: 'invoice.published',
      eventSource: 'api',
      statusAfter: result.status,
      idempotencyKey,
    })

    return NextResponse.json({
      invoiceId: result.invoiceId,
      invoiceUrl: result.invoiceUrl,
      invoiceNumber: result.invoiceNumber,
      status: result.status,
      orderId: result.orderId,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await writeAuditLog({
      bookingId,
      eventType: 'invoice.error',
      eventSource: 'api',
      errorDetail: { message: errorMessage },
      idempotencyKey,
    }).catch(() => {})

    if (errorMessage.includes('INVALID_EMAIL_ADDRESS')) {
      return NextResponse.json({ error: 'INVALID_EMAIL_ADDRESS' }, { status: 400 })
    }

    console.error('Square invoice creation failed:', error)
    return NextResponse.json({ error: 'SQUARE_API_ERROR', message: errorMessage }, { status: 500 })
  }
}

function buildServiceName(durationMinutes: number, slugConfig: unknown): string {
  if (slugConfig && typeof slugConfig === 'object' && 'name' in slugConfig) {
    return String((slugConfig as { name: string }).name)
  }
  return `${durationMinutes}-Minute Massage`
}
