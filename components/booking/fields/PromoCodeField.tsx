'use client'

import React, { useState } from 'react'
import { fieldClasses } from './classes'
import type { PromoDiscount } from '@/lib/promoCodes'
import booking from '@/data/booking.json'

const { promoCode: copy } = booking.form

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

  async function handleBlur(): Promise<void> {
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
    <div className={fieldClasses.row} data-content="booking.form.promoCode">
      <label htmlFor="promo" className={fieldClasses.label}>
        {copy.label}
      </label>
      <input
        aria-label={copy.ariaLabel}
        aria-invalid={validationState === 'invalid'}
        autoComplete="off"
        type="text"
        id="promo"
        name="promo"
        value={promoCode}
        className={fieldClasses.input}
        placeholder={copy.placeholder}
        onChange={(e) => {
          setValidationState('idle')
          setPromoMessage(null)
          onChange(e)
        }}
        onBlur={handleBlur}
      />
      {validationState === 'checking' && (
        <p className="mt-1 text-sm text-accent-500" aria-live="polite">
          {'Checking...' /* content-ok: transient UI state, not translatable copy */}
        </p>
      )}
      {validationState === 'valid' && promoMessage_ && (
        <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
          {copy.appliedPrefix} {promoMessage_}
        </p>
      )}
      {validationState === 'invalid' && (
        <p className="mt-1 text-sm text-red-500">{copy.errorInvalid}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
