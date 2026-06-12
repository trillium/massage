import React from 'react'
import { fieldClasses } from './classes'
import booking from '@/data/booking.json'

const { email: copy } = booking.form

type EmailFieldProps = {
  email: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function EmailField({ email, onChange }: EmailFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="email" className={fieldClasses.label}>
        {copy.label}
      </label>
      <input
        aria-label={copy.ariaLabel}
        required
        autoComplete="email"
        aria-required
        type="email"
        id="email"
        name="email"
        value={email}
        className={fieldClasses.input}
        placeholder={copy.placeholder}
        onChange={onChange}
      />
    </div>
  )
}
