'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RescheduleButtonProps {
  eventId: string
  token: string
  bookingUrl: string
}

export default function RescheduleButton({ eventId, token, bookingUrl }: RescheduleButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReschedule() {
    if (!confirming) {
      setConfirming(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/event/${eventId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, reason: 'reschedule' }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to reschedule')
        setLoading(false)
        return
      }

      router.push(bookingUrl)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {confirming && !loading && (
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          This will cancel your current appointment and let you book a new time.
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={handleReschedule}
          disabled={loading}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
            confirming
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'border border-primary-300 text-primary-600 hover:bg-primary-50 dark:border-primary-700 dark:text-primary-400 dark:hover:bg-primary-900/20'
          } disabled:opacity-50`}
        >
          {loading ? 'Rescheduling...' : confirming ? 'Confirm Reschedule' : 'Reschedule'}
        </button>
        {confirming && !loading && (
          <button
            onClick={() => setConfirming(false)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Never mind
          </button>
        )}
      </div>
    </div>
  )
}
