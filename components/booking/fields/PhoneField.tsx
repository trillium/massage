import React from 'react'
import { fieldClasses } from './classes'
import booking from '@/data/booking.json'

import { Input } from '@/components/ui/input'

const { phone: copy } = booking.form

type PhoneFieldProps = {
  phone: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PhoneField({ phone, onChange }: PhoneFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="phone" className={fieldClasses.label}>
        {copy.label}
      </label>
      <Input
        aria-label={copy.ariaLabel}
        required
        autoComplete="tel"
        aria-required
        id="phone"
        name="phone"
        value={phone}
        className={fieldClasses.input}
        placeholder={copy.placeholder}
        onChange={onChange}
      />
    </div>
  )
}
