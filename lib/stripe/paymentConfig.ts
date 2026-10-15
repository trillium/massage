export const PAYMENT_CURRENCY = 'usd'

export const PAYMENT_OFFERED_WHEN_STATUS = 'confirmed'

const MINIMUM_CHARGEABLE_CENTS = 1

export const CHECKOUT_PATHS = {
  success: '/payment/success',
  cancel: '/payment/cancelled',
}

const CENTS_PER_DOLLAR = 100

export function chargeAmountCents(appointmentPriceDollars: number | null): number {
  return Math.round((appointmentPriceDollars ?? 0) * CENTS_PER_DOLLAR)
}

export function requiresPayment(appointmentPriceDollars: number | null): boolean {
  return chargeAmountCents(appointmentPriceDollars) >= MINIMUM_CHARGEABLE_CENTS
}
