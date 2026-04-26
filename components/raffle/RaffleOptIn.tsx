'use client'

import { useState } from 'react'
import { RAFFLE_INTEREST_OPTIONS } from '@/lib/schema'

interface RaffleOptInProps {
  name: string
  email: string
  phone: string
}

export default function RaffleOptIn({ name, email, phone }: RaffleOptInProps) {
  const [zipCode, setZipCode] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (status === 'success') {
    return (
      <div className="mt-8 rounded-lg border-2 border-primary-300 bg-primary-50 p-6 dark:border-primary-700 dark:bg-primary-950">
        <p className="text-lg font-semibold text-primary-700 dark:text-primary-300">
          You're in the raffle!
        </p>
        <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
          We'll let you know if you win. Good luck!
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (interests.length === 0) return

    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/raffle/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          is_local: !!zipCode.trim(),
          zip_code: zipCode.trim() || null,
          interested_in: interests,
        }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json()
        setErrorMessage(data.error || 'Something went wrong')
        setStatus('error')
      }
    } catch {
      setErrorMessage('Network error — try again')
      setStatus('error')
    }
  }

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <div className="mt-8 rounded-lg border-2 border-primary-300 bg-surface-50 p-6 shadow-md dark:border-primary-700 dark:bg-surface-900">
      <p className="text-lg font-semibold text-accent-900 dark:text-accent-100">
        Enter the OpenClaw raffle!
      </p>
      <p className="mt-1 text-sm text-accent-600 dark:text-accent-400">
        Win a free 60-minute massage. Just a couple quick questions:
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="raffle-zip" className="block text-sm font-medium text-accent-900 dark:text-accent-100">
            Zip code
          </label>
          <input
            type="text"
            id="raffle-zip"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2"
            placeholder="90210"
            maxLength={10}
          />
        </div>

        <div>
          <p className="block text-sm font-medium text-accent-900 dark:text-accent-100">
            Interested in <span className="text-primary-500">*</span>
          </p>
          <div className="mt-1 space-y-2">
            {RAFFLE_INTEREST_OPTIONS.map(({ value, label }) => (
              <div className="flex items-center" key={value}>
                <input
                  type="checkbox"
                  id={`optin-${value}`}
                  checked={interests.includes(value)}
                  onChange={() => toggleInterest(value)}
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

        {errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting' || interests.length === 0}
          className="rounded bg-primary-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-surface-400"
        >
          {status === 'submitting' ? 'Entering...' : 'Enter Raffle'}
        </button>
      </form>
    </div>
  )
}
