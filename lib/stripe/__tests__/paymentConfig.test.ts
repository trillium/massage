import { describe, it, expect } from 'vitest'
import { chargeAmountCents, requiresPayment } from '../paymentConfig'

describe('paymentConfig', () => {
  it('converts the dollar appointment price to cents', () => {
    expect(chargeAmountCents(120)).toBe(12000)
  })

  it.each([null, 0, -5])('skips payment for price %s', (price) => {
    expect(requiresPayment(price)).toBe(false)
  })

  it('requires payment for a positive price', () => {
    expect(requiresPayment(1)).toBe(true)
  })
})
