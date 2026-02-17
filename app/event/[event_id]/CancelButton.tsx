'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelButton({ eventId, token }: { eventId: string; token: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel() {
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
        body: JSON.stringify({ token }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to cancel')
        setLoading(false)
        return
      }

      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCancel}
          disabled={loading}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
            confirming
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20'
          } disabled:opacity-50`}
        >
          {loading ? 'Cancelling...' : confirming ? 'Confirm Cancel' : 'Cancel Appointment'}
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
