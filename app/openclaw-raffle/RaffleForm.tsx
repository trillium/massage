'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useAppDispatch, useReduxFormData } from '@/redux/hooks'
import { setBookingForm } from '@/redux/slices/bookingFormSlice'
import { RAFFLE_INTEREST_OPTIONS } from '@/lib/schema'
import raffleData from '@/data/raffle.json'

const openclawData = raffleData.openclaw

interface RaffleFormProps {
  raffleId: string
  raffleName: string
}

interface FormValues {
  name: string
  email: string
  phone: string
  zip_code: string
  interested_in: string[]
}

const validate = (values: FormValues) => {
  const errors: Partial<Record<keyof FormValues, string>> = {}

  if (!values.name.trim()) errors.name = openclawData.nameErrorRequired
  if (!values.email.trim()) errors.email = openclawData.emailErrorRequired
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = openclawData.emailErrorInvalid
  if (!values.phone.trim()) errors.phone = openclawData.phoneErrorRequired
  if (!values.zip_code.trim()) errors.zip_code = openclawData.zipCodeErrorRequired
  if (values.interested_in.length === 0) errors.interested_in = openclawData.interestedErrorRequired

  return errors
}

const inputClasses =
  'focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2'

const labelClasses = 'block text-sm font-medium text-accent-900 dark:text-accent-100'

const checkboxClasses = 'h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500'

export default function RaffleForm({ raffleId, raffleName }: RaffleFormProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const formData = useReduxFormData()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lookupMessage, setLookupMessage] = useState<string | null>(null)

  const lookupEntry = useCallback(
    async (email: string, setFieldValue: (field: string, value: string | string[]) => void) => {
      setLookupMessage(null)
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return

      try {
        const params = new URLSearchParams({ email, raffle_id: raffleId })
        const res = await fetch(`/api/raffle/lookup?${params.toString()}`)
        const { entry } = await res.json()

        if (!entry) return

        setFieldValue('name', entry.name)
        setFieldValue('phone', entry.phone)
        setFieldValue('zip_code', entry.zip_code ?? '')
        setFieldValue('interested_in', entry.interested_in ?? [])
        setLookupMessage(openclawData.welcomeBackMessage)
      } catch (err) {
        console.error('Raffle lookup failed:', err)
      }
    },
    [raffleId]
  )

  const handleSubmit = async (
    values: FormValues,
    { setErrors }: { setErrors: (errors: Partial<Record<keyof FormValues, string>>) => void }
  ) => {
    setSubmitError(null)

    try {
      const response = await fetch('/api/raffle/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          is_local: !!values.zip_code.trim(),
          zip_code: values.zip_code.trim() || null,
          interested_in: values.interested_in,
          raffle_id: raffleId,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        dispatch(
          setBookingForm({
            raffleName,
            firstName: values.name.split(' ')[0] || values.name,
            lastName: values.name.split(' ').slice(1).join(' '),
            email: values.email,
            phone: values.phone,
            raffleInterests: values.interested_in,
          })
        )
        router.push('/openclaw-raffle/entered')
      } else if (result.details) {
        const fieldErrors: Partial<Record<keyof FormValues, string>> = {}
        for (const issue of result.details) {
          const field = issue.path?.[0] as keyof FormValues | undefined
          if (field && field in values) {
            fieldErrors[field] = issue.message
          }
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
        } else {
          setSubmitError(result.error || openclawData.errorGeneric)
        }
      } else {
        setSubmitError(result.error || openclawData.errorGeneric)
      }
    } catch {
      setSubmitError(openclawData.errorNetwork)
    }
  }

  return (
    <div className="border-white-500 focus-within:border-primary-500 flex w-full flex-col items-center space-y-4 rounded-lg border-2 bg-surface-50 p-6 shadow-md dark:bg-surface-900">
      <Formik<FormValues>
        initialValues={{
          name: [formData?.firstName, formData?.lastName].filter(Boolean).join(' '),
          email: formData?.email ?? '',
          phone: formData?.phone ?? '',
          zip_code: '',
          interested_in: formData?.raffleInterests ?? [],
        }}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="w-full space-y-6">
            <div>
              <label htmlFor="name" className={labelClasses}>
                {openclawData.nameLabel}{' '}
                <span className="text-primary-500">{openclawData.requiredAsterisk}</span>
              </label>
              <Field
                type="text"
                id="name"
                name="name"
                className={inputClasses}
                placeholder={openclawData.namePlaceholder}
                disabled={isSubmitting}
              />
              <div className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
                <ErrorMessage name="name" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClasses}>
                {openclawData.emailLabel}{' '}
                <span className="text-primary-500">{openclawData.requiredAsterisk}</span>
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
              <div className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
                <ErrorMessage name="email" />
              </div>
              {lookupMessage && (
                <div className="mt-1 text-sm text-primary-600 dark:text-primary-400">
                  {lookupMessage}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="phone" className={labelClasses}>
                {openclawData.phoneLabel}{' '}
                <span className="text-primary-500">{openclawData.requiredAsterisk}</span>
              </label>
              <Field
                type="tel"
                id="phone"
                name="phone"
                className={inputClasses}
                placeholder={openclawData.phonePlaceholder}
                disabled={isSubmitting}
              />
              <div className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
                <ErrorMessage name="phone" />
              </div>
            </div>

            <div>
              <label htmlFor="zip_code" className={labelClasses}>
                {openclawData.zipCodeLabel}{' '}
                <span className="text-primary-500">{openclawData.requiredAsterisk}</span>
              </label>
              <Field
                type="text"
                id="zip_code"
                name="zip_code"
                className={inputClasses}
                placeholder={openclawData.zipCodePlaceholder}
                disabled={isSubmitting}
                maxLength={10}
              />
              <div className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
                <ErrorMessage name="zip_code" />
              </div>
            </div>

            <div>
              <p className={labelClasses}>
                {openclawData.interestedLabel}{' '}
                <span className="text-primary-500">{openclawData.requiredAsterisk}</span>
              </p>
              <div className="space-y-2">
                {RAFFLE_INTEREST_OPTIONS.map(({ value, label }) => (
                  <div className="flex items-center" key={value}>
                    <input
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
                    <label
                      htmlFor={`interested-${value}`}
                      className="ms-2 font-medium text-accent-800 dark:text-accent-100"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
                <ErrorMessage name="interested_in" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 border-primary-500 rounded border-2 px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-surface-400"
            >
              {isSubmitting ? openclawData.enterButtonSubmitting : openclawData.enterButtonDefault}
            </button>
            <div>
              {submitError && (
                <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                  {submitError}
                </div>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
