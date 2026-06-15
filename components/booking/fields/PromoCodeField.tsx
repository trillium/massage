'use client'

import React, { useState } from 'react'
import { fieldClasses } from './classes'
import type { PromoDiscount } from '@/lib/promoCodes'
import booking from '@/data/booking.json'
import { TextPrimary, TextSm, TextSmMuted } from '@/components/ui/text'

import { Input } from '@/components/ui/input'

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
      <Input
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
        <TextSmMuted className="mt-1" aria-live="polite">
          {'Checking...' /* content-ok: transient UI state, not translatable copy */}
        </TextSmMuted>
      )}
      {validationState === 'valid' && promoMessage_ && (
        <TextPrimary className="mt-1">
          {copy.appliedPrefix} {promoMessage_}
        </TextPrimary>
      )}
      {validationState === 'invalid' && (
        <TextSm className="mt-1" status="error">
          {copy.errorInvalid}
        </TextSm>
      )}
      {error && (
        <TextSm className="mt-1" status="error">
          {error}
        </TextSm>
      )}
    </div>
  )
}
