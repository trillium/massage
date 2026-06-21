'use client'

import posthog from 'posthog-js'
import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/redux/hooks'
import { setBookingForm } from '@/redux/slices/bookingFormSlice'
import type { FormValues } from 'app/nerdstage-raffle/raffleFormUtils'

type RaffleFormMessages = {
  welcomeBackMessage: string
  errorGeneric: string
  errorNetwork: string
}

type UseRaffleFormParams = {
  raffleId: string
  raffleName: string
  confirmedPath: string
  messages: RaffleFormMessages
  lookupContext: string
}

export function useRaffleForm({
  raffleId,
  raffleName,
  confirmedPath,
  messages,
  lookupContext,
}: UseRaffleFormParams) {
  const router = useRouter()
  const dispatch = useAppDispatch()
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
        setLookupMessage(messages.welcomeBackMessage)
      } catch (err) {
        console.error('Raffle lookup failed:', err)
        posthog.captureException(err, { context: lookupContext })
      }
    },
    [raffleId, messages.welcomeBackMessage, lookupContext]
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
        router.push(confirmedPath)
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
          setSubmitError(result.error || messages.errorGeneric)
        }
      } else {
        setSubmitError(result.error || messages.errorGeneric)
      }
    } catch {
      setSubmitError(messages.errorNetwork)
    }
  }

  return { submitError, lookupMessage, lookupEntry, handleSubmit }
}
