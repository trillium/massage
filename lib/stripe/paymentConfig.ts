export const PAYMENT_CURRENCY = 'usd'

export const PAYMENT_OFFERED_WHEN_STATUS = 'confirmed'

const MINIMUM_CHARGEABLE_CENTS = 1

export const CHECKOUT_PATHS = {
  success: '/payment/success',
  cancel: '/payment/cancelled',
}

export function chargeAmountCents(appointmentPriceCents: number | null): number {
  return appointmentPriceCents ?? 0
}

export function requiresPayment(appointmentPriceCents: number | null): boolean {
  return chargeAmountCents(appointmentPriceCents) >= MINIMUM_CHARGEABLE_CENTS
}
