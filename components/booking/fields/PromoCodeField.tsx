'use client'

import React, { useState } from 'react'
import { fieldClasses } from './classes'
import type { PromoDiscount } from '@/lib/promoCodes'

type PromoCodeFieldProps = {
  promoCode: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
}

function promoMessage(discount: PromoDiscount): string {
  if (discount.type === 'minutes') return `+${discount.bonusMinutes} min upgrade applied`
  if (discount.type === 'dollar') return `$${discount.amountDollars} off applied`
  if (discount.type === 'percent') return `${(discount.amountPercent ?? 0) * 100}% off applied`
  return 'Promo applied'
}

export default function PromoCodeField({ promoCode, onChange, error }: PromoCodeFieldProps) {
  const [validationState, setValidationState] = useState<'idle' | 'checking' | 'valid' | 'invalid'>(
    'idle'
  )
  const [promoMessage_, setPromoMessage] = useState<string | null>(null)

  async function handleBlur() {
    if (!promoCode.trim()) {
      setValidationState('idle')
      setPromoMessage(null)
      return
    }
    setValidationState('checking')
    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      })
      const data = await res.json()
      if (data.valid) {
        setValidationState('valid')
        setPromoMessage(promoMessage(data.discount))
      } else {
        setValidationState('invalid')
        setPromoMessage(null)
      }
    } catch {
      setValidationState('idle')
    }
  }

  return (
    <div className={fieldClasses.row}>
      <label htmlFor="promo" className={fieldClasses.label}>
        Have a code?
      </label>
      <input
        aria-label="Promo Code"
        aria-invalid={validationState === 'invalid'}
        autoComplete="off"
        type="text"
        id="promo"
        name="promo"
        value={promoCode}
        className={fieldClasses.input}
        placeholder="Enter it here"
        onChange={(e) => {
          setValidationState('idle')
          setPromoMessage(null)
          onChange(e)
        }}
        onBlur={handleBlur}
      />
      {validationState === 'valid' && promoMessage_ && (
        <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">✓ {promoMessage_}</p>
      )}
      {validationState === 'invalid' && (
        <p className="mt-1 text-sm text-red-500">Invalid promo code</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
