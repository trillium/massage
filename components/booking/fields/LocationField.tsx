'use client'

import React from 'react'
import clsx from 'clsx'
import { LocationObject } from 'lib/types'
import { fieldClasses } from './classes'
import { LocationValidationConfig } from './validations/locationValidation'

type LocationFieldErrors = {
  street?: string
  city?: string
  zip?: string
}

type LocationFieldProps = {
  location: LocationObject
  readOnly: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  validationConfig?: LocationValidationConfig
  errors?: LocationFieldErrors
}

export default function LocationField({
  location,
  readOnly,
  onChange,
  onBlur,
  validationConfig,
  errors = {},
}: LocationFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="location" className={fieldClasses.label}>
        Street {errors.street && <span className="mt-1 text-sm text-red-600">{errors.street}</span>}
      </label>
      <input
        aria-label="street address"
        required
        autoComplete="street-address"
        aria-required
        id="location"
        name="location"
        value={location.street}
        readOnly={readOnly}
        className={clsx(fieldClasses.inputBase, {
          [fieldClasses.focusReadOnly]: readOnly,
          [fieldClasses.focusNormal]: !readOnly,
          [fieldClasses.inputReadOnly]: readOnly,
          'border-red-500': errors.street && !readOnly,
        })}
        placeholder="123 Address Road, Beverly Hills, CA 90210"
        onChange={onChange}
      />
      <div className={fieldClasses.flexRowWithMargin}>
        <div className={fieldClasses.flexHalfWidth}>
          <label htmlFor="city" className={fieldClasses.label}>
            City {errors.city && <span className="mt-1 text-sm text-red-600">{errors.city}</span>}
          </label>
          <input
            aria-label="city"
            required
            autoComplete="address-level2"
            aria-required
            id="city"
            name="city"
            value={location.city}
            readOnly={readOnly}
            className={clsx(
              fieldClasses.inputBase,
              readOnly ? fieldClasses.focusReadOnly : fieldClasses.focusNormal,
              {
                [fieldClasses.inputReadOnly]: readOnly,
                'border-red-500': errors.city && !readOnly,
              }
            )}
            placeholder="Los Angeles"
            onChange={onChange}
            onBlur={onBlur}
          />
        </div>
        <div className={fieldClasses.flexHalfWidth}>
          <label htmlFor="zipCode" className={fieldClasses.label}>
            Zip Code {errors.zip && <span className="mt-1 text-sm text-red-600">{errors.zip}</span>}
          </label>
          <input
            aria-label="zip code"
            required
            autoComplete="postal-code"
            aria-required
            id="zipCode"
            name="zipCode"
            value={location.zip}
            readOnly={readOnly}
            className={clsx(
              fieldClasses.inputBase,
              readOnly ? fieldClasses.focusReadOnly : fieldClasses.focusNormal,
              {
                [fieldClasses.inputReadOnly]: readOnly,
                'border-red-500': errors.zip && !readOnly,
              }
            )}
            placeholder="90210"
            pattern="\d{5}(-\d{4})?"
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  )
}
