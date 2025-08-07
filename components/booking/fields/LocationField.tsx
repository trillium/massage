import React from 'react'
import clsx from 'clsx'
import { LocationObject } from 'lib/types'
import { fieldClasses } from './classes'

type LocationFieldProps = {
  location: LocationObject
  readOnly: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function LocationField({ location, readOnly, onChange }: LocationFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="location" className={fieldClasses.label}>
        Street
      </label>
      <input
        aria-label="street address"
        required
        autoComplete="street-address"
        aria-required
        name="location"
        id="location"
        value={location.street}
        readOnly={readOnly}
        className={clsx(fieldClasses.inputBase, {
          [fieldClasses.focusReadOnly]: readOnly,
          [fieldClasses.focusNormal]: !readOnly,
          [fieldClasses.inputReadOnly]: readOnly,
        })}
        placeholder="123 Address Road, Beverly Hills, CA 90210"
        onChange={onChange}
      />
      <div className={fieldClasses.flexRowWithMargin}>
        <div className={fieldClasses.flexHalfWidth}>
          <label htmlFor="city" className={fieldClasses.label}>
            City
          </label>
          <input
            aria-label="city"
            required
            autoComplete="address-level2"
            aria-required
            name="city"
            id="city"
            value={location.city}
            readOnly={readOnly}
            className={clsx(
              fieldClasses.inputBase,
              readOnly ? fieldClasses.focusReadOnly : fieldClasses.focusNormal,
              {
                [fieldClasses.inputReadOnly]: readOnly,
              }
            )}
            placeholder="Los Angeles"
            onChange={onChange}
          />
        </div>
        <div className={fieldClasses.flexHalfWidth}>
          <label htmlFor="zipCode" className={fieldClasses.label}>
            Zip Code
          </label>
          <input
            aria-label="zip code"
            required
            autoComplete="postal-code"
            aria-required
            name="zipCode"
            id="zipCode"
            value={location.zip}
            readOnly={readOnly}
            className={clsx(
              fieldClasses.inputBase,
              readOnly ? fieldClasses.focusReadOnly : fieldClasses.focusNormal,
              {
                [fieldClasses.inputReadOnly]: readOnly,
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
