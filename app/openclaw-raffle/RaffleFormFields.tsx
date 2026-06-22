'use client'

import { Field, ErrorMessage } from 'formik'
import { RAFFLE_INTEREST_OPTIONS } from '@/lib/schema'
import raffleData from '@/data/raffle.json'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TextBase, TextPrimary } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

const openclawData = raffleData.openclaw

const inputClasses =
  'focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2'

const labelClasses = 'block text-sm font-medium text-accent-900 dark:text-accent-100'

const checkboxClasses = 'h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500'

interface FormValues {
  name: string
  email: string
  phone: string
  zip_code: string
  interested_in: string[]
}

interface RaffleFormFieldsProps {
  isSubmitting: boolean
  values: FormValues
  setFieldValue: (field: string, value: string | string[]) => void
  submitError: string | null
  lookupMessage: string | null
  lookupEntry: (email: string, setFieldValue: (field: string, value: string | string[]) => void) => void
}

export function RaffleFormFields({
  isSubmitting,
  values,
  setFieldValue,
  submitError,
  lookupMessage,
  lookupEntry,
}: RaffleFormFieldsProps) {
  return (
    <>
      <Box>
        <label htmlFor="name" className={labelClasses}>
          {openclawData.nameLabel}{' '}
          <TextPrimary as="span">{openclawData.requiredAsterisk}</TextPrimary>
        </label>
        <Field type="text" id="name" name="name" className={inputClasses} placeholder={openclawData.namePlaceholder} disabled={isSubmitting} />
        <Box className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
          <ErrorMessage name="name" />
        </Box>
      </Box>

      <Box>
        <label htmlFor="email" className={labelClasses}>
          {openclawData.emailLabel}{' '}
          <TextPrimary as="span">{openclawData.requiredAsterisk}</TextPrimary>
        </label>
        <Field
          type="email"
          id="email"
          name="email"
          className={inputClasses}
          placeholder={openclawData.emailPlaceholder}
          disabled={isSubmitting}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            lookupEntry(e.target.value, setFieldValue)
          }}
        />
        <Box className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
          <ErrorMessage name="email" />
        </Box>
        {lookupMessage && (
          <Box className="mt-1 text-sm text-primary-600 dark:text-primary-400">{lookupMessage}</Box>
        )}
      </Box>

      <Box>
        <label htmlFor="phone" className={labelClasses}>
          {openclawData.phoneLabel}{' '}
          <TextPrimary as="span">{openclawData.requiredAsterisk}</TextPrimary>
        </label>
        <Field type="tel" id="phone" name="phone" className={inputClasses} placeholder={openclawData.phonePlaceholder} disabled={isSubmitting} />
        <Box className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
          <ErrorMessage name="phone" />
        </Box>
      </Box>

      <Box>
        <label htmlFor="zip_code" className={labelClasses}>
          {openclawData.zipCodeLabel}{' '}
          <TextPrimary as="span">{openclawData.requiredAsterisk}</TextPrimary>
        </label>
        <Field type="text" id="zip_code" name="zip_code" className={inputClasses} placeholder={openclawData.zipCodePlaceholder} disabled={isSubmitting} maxLength={10} />
        <Box className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
          <ErrorMessage name="zip_code" />
        </Box>
      </Box>

      <Box>
        <TextBase className={labelClasses}>
          {openclawData.interestedLabel}{' '}
          <TextPrimary as="span">{openclawData.requiredAsterisk}</TextPrimary>
        </TextBase>
        <Box className="space-y-2">
          {RAFFLE_INTEREST_OPTIONS.map(({ value, label }) => (
            <Stack direction="row" align="center" key={value}>
              <Input
                type="checkbox"
                id={`interested-${value}`}
                className={checkboxClasses}
                checked={values.interested_in.includes(value)}
                disabled={isSubmitting}
                onChange={() => {
                  const next = values.interested_in.includes(value)
                    ? values.interested_in.filter((v) => v !== value)
                    : [...values.interested_in, value]
                  setFieldValue('interested_in', next)
                }}
              />
              <label htmlFor={`interested-${value}`} className="ms-2 font-medium text-accent-800 dark:text-accent-100">
                {label}
              </label>
            </Stack>
          ))}
        </Box>
        <Box className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
          <ErrorMessage name="interested_in" />
        </Box>
      </Box>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary-600 hover:bg-primary-700 border-primary-500 rounded border-2 px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-surface-400"
      >
        {isSubmitting ? openclawData.enterButtonSubmitting : openclawData.enterButtonDefault}
      </Button>

      <Box>
        {submitError && (
          <Box className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            {submitError}
          </Box>
        )}
      </Box>
    </>
  )
}
