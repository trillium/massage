import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new NextResponse('Missing signature', { status: 401 })

  let webhookSecret: string
  try {
    webhookSecret = getStripeWebhookSecret()
  } catch {
    console.error('Stripe webhook configuration missing')
    return new NextResponse('Server misconfigured', { status: 500 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = getStripeClient().webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  try {
    await processEvent(event)
  } catch (error) {
    console.error(`Stripe webhook ${event.type} processing failed:`, error)
    return new NextResponse('Processing failed', { status: 500 })
  }

  return new NextResponse('OK', { status: 200 })
}

async function processEvent(event: Stripe.Event) {
  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    return
  }
  const session = event.data.object
  if (session.payment_status !== 'paid') return
  await markAppointmentPaid(session)
}

async function markAppointmentPaid(session: Stripe.Checkout.Session) {
  const appointmentId = session.client_reference_id ?? session.metadata?.appointmentId
  if (!appointmentId) {
    console.warn(`Stripe session ${session.id} has no appointment reference`)
    return
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) throw new Error('Supabase client unavailable')

  const { error } = await supabase
    .from('appointments')
    .update({ stripe_checkout_session_id: session.id, paid_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .is('paid_at', null)

  if (error) throw new Error(error.message)
}
