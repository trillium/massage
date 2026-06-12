export type PromoDiscount =
  | { type: 'percent'; amountPercent: number }
  | { type: 'dollar'; amountDollars: number }
  | { type: 'minutes'; bonusMinutes: number; minDuration: number }

export type PromoCode = {
  code: string
  discount: PromoDiscount
  description: string
}

const PROMO_CODES: PromoCode[] = [
  {
    code: 'OVERTIME',
    discount: { type: 'minutes', bonusMinutes: 15, minDuration: 60 },
    description: '+15 min upgrade on 60+ minute sessions',
  },
]

export function validatePromoCode(code: string): PromoCode | null {
  const normalized = code.trim().toUpperCase()
  return PROMO_CODES.find((p) => p.code === normalized) ?? null
}
