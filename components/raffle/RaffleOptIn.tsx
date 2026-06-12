'use client'

import { useState } from 'react'
import { RAFFLE_INTEREST_OPTIONS } from '@/lib/schema'
import raffle from '@/data/raffle.json'

interface RaffleOptInProps {
  name: string
  email: string
  phone: string
}

function SuccessBanner() {
  return (
    <div className="mt-8 rounded-lg border-2 border-primary-300 bg-primary-50 p-6 dark:border-primary-700 dark:bg-primary-950">
      <p className="text-lg font-semibold text-primary-700 dark:text-primary-300">
        {raffle.successBannerTitle}
      </p>
      <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
        {raffle.successBannerMessage}
      </p>
    </div>
  )
}

function InterestCheckboxes({
  interests,
  onToggle,
}: {
  interests: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <p className="block text-sm font-medium text-accent-900 dark:text-accent-100">
        {raffle.interestedLabel} <span className="text-primary-500">{raffle.requiredAsterisk}</span>
      </p>
      <div className="mt-1 space-y-2">
        {RAFFLE_INTEREST_OPTIONS.map(({ value, label }) => (
          <div className="flex items-center" key={value}>
            <input
              type="checkbox"
              id={`optin-${value}`}
              checked={interests.includes(value)}
              onChange={() => onToggle(value)}
              className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor={`optin-${value}`}
              className="ms-2 font-medium text-accent-800 dark:text-accent-100"
            >
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

async function submitRaffleEntry(payload: {
  name: string
  email: string
  phone: string
  is_local: boolean
  zip_code: string | null
  interested_in: string[]
}) {
  return fetch('/api/raffle/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export default function RaffleOptIn({ name, email, phone }: RaffleOptInProps) {
  const [zipCode, setZipCode] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (status === 'success') return <SuccessBanner />

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (interests.length === 0) return

    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await submitRaffleEntry({
        name,
        email,
        phone,
        is_local: !!zipCode.trim(),
        zip_code: zipCode.trim() || null,
        interested_in: interests,
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json()
        setErrorMessage(data.error || 'Something went wrong')
        setStatus('error')
      }
    } catch {
      setErrorMessage(raffle.errorNetwork)
      setStatus('error')
    }
  }

  return (
    <div className="mt-8 rounded-lg border-2 border-primary-300 bg-surface-50 p-6 shadow-md dark:border-primary-700 dark:bg-surface-900">
      <p className="text-lg font-semibold text-accent-900 dark:text-accent-100">
        {raffle.raffleTitle}
      </p>
      <p className="mt-1 text-sm text-accent-600 dark:text-accent-400">{raffle.raffleSubtitle}</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="raffle-zip"
            className="block text-sm font-medium text-accent-900 dark:text-accent-100"
          >
            {raffle.zipCodeLabel}
          </label>
          <input
            type="text"
            id="raffle-zip"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2"
            placeholder={raffle.zipCodePlaceholder}
            maxLength={10}
          />
        </div>

        <InterestCheckboxes interests={interests} onToggle={toggleInterest} />

        {errorMessage && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === 'submitting' || interests.length === 0}
          className="rounded bg-primary-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-surface-400"
        >
          {status === 'submitting' ? raffle.enterButtonSubmitting : raffle.enterButtonDefault}
        </button>
      </form>
    </div>
  )
}
