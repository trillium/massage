import type Stripe from 'stripe'
import { getStripeClient } from './client'
import { CHECKOUT_PATHS, PAYMENT_CURRENCY, chargeAmountCents } from './paymentConfig'

interface CheckoutAppointment {
  id: string
  client_email: string
  price: number | null
  duration_minutes: number
  slug_config: unknown
}

function buildServiceName(durationMinutes: number, slugConfig: unknown): string {
  if (slugConfig && typeof slugConfig === 'object' && 'name' in slugConfig) {
    return String((slugConfig as { name: string }).name)
  }
  return `${durationMinutes}-Minute Massage`
}

export async function createCheckoutSession(
  appointment: CheckoutAppointment,
  origin: string
): Promise<Stripe.Checkout.Session> {
  return getStripeClient().checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: appointment.client_email,
      client_reference_id: appointment.id,
      metadata: { appointmentId: appointment.id },
      payment_intent_data: { metadata: { appointmentId: appointment.id } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PAYMENT_CURRENCY,
            unit_amount: chargeAmountCents(appointment.price),
            product_data: {
              name: buildServiceName(appointment.duration_minutes, appointment.slug_config),
            },
          },
        },
      ],
      success_url: `${origin}${CHECKOUT_PATHS.success}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${CHECKOUT_PATHS.cancel}`,
    },
    { idempotencyKey: `checkout-${appointment.id}-${chargeAmountCents(appointment.price)}` }
  )
}
