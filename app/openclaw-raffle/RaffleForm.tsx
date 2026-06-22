'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form } from 'formik'
import { useAppDispatch, useReduxFormData } from '@/redux/hooks'
import { setBookingForm } from '@/redux/slices/bookingFormSlice'
import raffleData from '@/data/raffle.json'
import { Stack } from '@/components/ui/stack'
import { RaffleFormFields } from './RaffleFormFields'

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
    <Stack
      className="border-white-500 focus-within:border-primary-500 w-full space-y-4 rounded-lg border-2 bg-surface-50 p-6 shadow-md dark:bg-surface-900"
      direction="col"
      align="center"
    >
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
            <RaffleFormFields
              isSubmitting={isSubmitting}
              values={values}
              setFieldValue={setFieldValue}
              submitError={submitError}
              lookupMessage={lookupMessage}
              lookupEntry={lookupEntry}
            />
          </Form>
        )}
      </Formik>
    </Stack>
  )
}
