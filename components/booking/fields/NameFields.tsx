import React from 'react'
import { fieldClasses } from './classes'
import booking from '@/data/booking.json'

const { firstName: firstNameCopy, lastName: lastNameCopy } = booking.form

type NameFieldsProps = {
  firstName: string
  lastName: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function NameFields({ firstName, lastName, onChange }: NameFieldsProps) {
  return (
    <div className={fieldClasses.row}>
      <div className={fieldClasses.flexRow}>
        <div className={fieldClasses.flexHalfWidth}>
          <label htmlFor="firstName" className={fieldClasses.label}>
            {firstNameCopy.label}
          </label>
          <input
            aria-label={firstNameCopy.ariaLabel}
            type="text"
            autoCapitalize="words"
            autoComplete="given-name"
            required
            aria-required
            id="firstName"
            name="firstName"
            value={firstName}
            placeholder={firstNameCopy.placeholder}
            onChange={onChange}
            className={fieldClasses.input}
          />
        </div>
        <div className={fieldClasses.flexHalfWidth}>
          <label htmlFor="lastName" className={fieldClasses.label}>
            {lastNameCopy.label}
          </label>
          <input
            aria-label={lastNameCopy.ariaLabel}
            type="text"
            autoCapitalize="words"
            autoComplete="family-name"
            required
            aria-required
            id="lastName"
            name="lastName"
            value={lastName}
            placeholder={lastNameCopy.placeholder}
            onChange={onChange}
            className={fieldClasses.input}
          />
        </div>
      </div>
    </div>
  )
}
