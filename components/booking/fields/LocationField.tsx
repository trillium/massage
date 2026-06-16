'use client'

import React from 'react'
import clsx from 'clsx'
import { LocationObject } from 'lib/types'
import { fieldClasses } from './classes'
import { LocationValidationConfig } from './validations/locationValidation'
import booking from '@/data/booking.json'
import { TextSm } from '@/components/ui/text'

import { Input } from '@/components/ui/input'
import { Box } from '@/components/ui/box'

const { location: copy } = booking.form

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
    <Box className={fieldClasses.row}>
      <label htmlFor="location" className={fieldClasses.label}>
        {copy.street.label}{' '}
        {errors.street && (
          <TextSm className="mt-1" status="error">
            {errors.street}
          </TextSm>
        )}
      </label>
      <Input
        aria-label={copy.street.ariaLabel}
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
        placeholder={copy.street.placeholder}
        onChange={onChange}
      />
      <Box className={fieldClasses.flexRowWithMargin}>
        <Box className={fieldClasses.flexHalfWidth}>
          <label htmlFor="city" className={fieldClasses.label}>
            {copy.city.label}{' '}
            {errors.city && (
              <TextSm className="mt-1" status="error">
                {errors.city}
              </TextSm>
            )}
          </label>
          <Input
            aria-label={copy.city.ariaLabel}
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
            placeholder={copy.city.placeholder}
            onChange={onChange}
            onBlur={onBlur}
          />
        </Box>
        <Box className={fieldClasses.flexHalfWidth}>
          <label htmlFor="zipCode" className={fieldClasses.label}>
            {copy.zip.label}{' '}
            {errors.zip && (
              <TextSm className="mt-1" status="error">
                {errors.zip}
              </TextSm>
            )}
          </label>
          <Input
            aria-label={copy.zip.ariaLabel}
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
            placeholder={copy.zip.placeholder}
            pattern="\d{5}(-\d{4})?"
            inputMode="numeric"
            maxLength={10}
            onChange={onChange}
            onInput={(e) => {
              const target = e.target as HTMLInputElement
              target.value = target.value.replace(/[^\d-]/g, '')
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
