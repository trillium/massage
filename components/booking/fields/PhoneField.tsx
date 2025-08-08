import React from 'react'
import { fieldClasses } from './classes'

type PhoneFieldProps = {
  phone: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PhoneField({ phone, onChange }: PhoneFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="phone" className={fieldClasses.label}>
        Phone Number
      </label>
      <input
        aria-label="Phone Number"
        required
        autoComplete="tel"
        aria-required
        id="phone"
        name="phone"
        value={phone}
        className={fieldClasses.input}
        placeholder="(555) 444 - 3333"
        onChange={onChange}
      />
    </div>
  )
}
