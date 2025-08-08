import React from 'react'
import { fieldClasses } from './classes'

type EmailFieldProps = {
  email: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function EmailField({ email, onChange }: EmailFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="email" className={fieldClasses.label}>
        Email Address
      </label>
      <input
        aria-label="Email"
        required
        autoComplete="email"
        aria-required
        type="email"
        id="email"
        name="email"
        value={email}
        className={fieldClasses.input}
        placeholder="name@example.com"
        onChange={onChange}
      />
    </div>
  )
}
