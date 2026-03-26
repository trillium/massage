import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { getSquareClient } from '@/lib/square/client'
import { writeAuditLog } from '@/lib/square/invoice'

const UpdateEmailSchema = z.object({
  newEmail: z.string().email(),
  bookingId: z.string().uuid(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params
  const body = await req.json()
  const parsed = UpdateEmailSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { newEmail, bookingId } = parsed.data
  const supabase = getSupabaseAdminClient()

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('square_invoice_id', invoiceId)
    .eq('booking_id', bookingId)
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: 'INVOICE_NOT_FOUND' }, { status: 404 })
  }

  if (invoice.status === 'PAID' || invoice.status === 'CANCELED') {
    return NextResponse.json(
      { error: 'INVOICE_NOT_MODIFIABLE', status: invoice.status },
      { status: 400 }
    )
  }

  const client = getSquareClient()

  try {
    await client.customers.update({
      customerId: invoice.square_customer_id,
      emailAddress: newEmail,
    })

    const currentInvoice = await client.invoices.get({ invoiceId })
    const currentVersion = currentInvoice.invoice?.version

    if (currentVersion == null) {
      return NextResponse.json({ error: 'INVOICE_VERSION_UNKNOWN' }, { status: 500 })
    }

    const republished = await client.invoices.publish({
      invoiceId,
      version: currentVersion,
    })

    await supabase
      .from('invoices')
      .update({
        email_sent_to: newEmail,
        email_updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.id)

    await writeAuditLog({
      bookingId,
      squareInvoiceId: invoiceId,
      eventType: 'email.updated',
      eventSource: 'api',
      payload: { oldEmail: invoice.email_sent_to, newEmail },
    })

    await writeAuditLog({
      bookingId,
      squareInvoiceId: invoiceId,
      eventType: 'invoice.email_resent',
      eventSource: 'api',
      statusAfter: republished.invoice?.status,
    })

    return NextResponse.json({
      success: true,
      invoiceId,
      emailSentTo: newEmail,
      status: republished.invoice?.status,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Email update failed:', error)

    await writeAuditLog({
      bookingId,
      squareInvoiceId: invoiceId,
      eventType: 'invoice.error',
      eventSource: 'api',
      errorDetail: { message: errorMessage, action: 'update-email' },
    }).catch(() => {})

    return NextResponse.json({ error: 'SQUARE_API_ERROR', message: errorMessage }, { status: 500 })
  }
}
