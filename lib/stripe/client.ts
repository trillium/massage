import Stripe from 'stripe'

let cachedClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (cachedClient) return cachedClient

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not set')

  cachedClient = new Stripe(secretKey)
  return cachedClient
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  return secret
}
