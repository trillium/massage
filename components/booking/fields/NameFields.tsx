import React from 'react'
import { fieldClasses } from './classes'

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
            First Name
          </label>
          <input
            aria-label="Name"
            type="text"
            autoCapitalize="words"
            autoComplete="given-name"
            required
            aria-required
            id="firstName"
            name="firstName"
            value={firstName}
            placeholder="First"
            onChange={onChange}
            className={fieldClasses.input}
          />
        </div>
        <div className={fieldClasses.flexHalfWidth}>
          <label htmlFor="lastName" className={fieldClasses.label}>
            Last Name
          </label>
          <input
            aria-label="Name"
            type="text"
            autoCapitalize="words"
            autoComplete="family-name"
            required
            aria-required
            id="lastName"
            name="lastName"
            value={lastName}
            placeholder="Last"
            onChange={onChange}
            className={fieldClasses.input}
          />
        </div>
      </div>
    </div>
  )
}
