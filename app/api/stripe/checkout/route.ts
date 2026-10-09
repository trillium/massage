import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe/checkout'
import { PAYMENT_OFFERED_WHEN_STATUS, requiresPayment } from '@/lib/stripe/paymentConfig'

const CheckoutRequestSchema = z.object({
  bookingId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const parsed = CheckoutRequestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ error: 'SERVER_MISCONFIGURED' }, { status: 500 })

  const { data: booking } = await supabase
    .from('appointments')
    .select('id, client_email, price, duration_minutes, slug_config, status, paid_at')
    .eq('id', parsed.data.bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'BOOKING_NOT_FOUND' }, { status: 404 })
  if (booking.status !== PAYMENT_OFFERED_WHEN_STATUS) {
    return NextResponse.json({ error: 'BOOKING_NOT_CONFIRMED' }, { status: 409 })
  }
  if (booking.paid_at) return NextResponse.json({ error: 'ALREADY_PAID' }, { status: 409 })
  if (!requiresPayment(booking.price)) {
    return NextResponse.json({ error: 'PAYMENT_NOT_REQUIRED' }, { status: 400 })
  }

  try {
    const session = await createCheckoutSession(booking, req.nextUrl.origin)
    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error)
    return NextResponse.json({ error: 'STRIPE_API_ERROR' }, { status: 500 })
  }
}
