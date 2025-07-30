'use client'
import { useState, useEffect } from 'react'
import posthog from 'posthog-js'

export default function IsTestUserPage() {
  const [userId, setUserId] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [distinctId, setDistinctId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (process.env.NEXT_PUBLIC_DISABLE_POSTHOG === 'true') {
        setDistinctId('PostHog is disabled')
        console.log('[PostHog]', 'PostHog is disabled in environment')
        return
      }

      if (posthog && posthog.__loaded) {
        const posthogId = posthog.get_distinct_id()
        console.log('[posthogId]', posthogId)
        setDistinctId(posthogId)
      } else {
        setDistinctId('PostHog not loaded')
        console.log('[PostHog]', 'PostHog not loaded yet')
      }
    }
  }, [refreshKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/isTestUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult('User marked as test user!')
      } else {
        setResult(data.error || 'Error')
      }
    } catch (err) {
      setResult('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold">Mark User as Test User</h1>
      <div className="mb-4 text-sm text-gray-700">
        <strong>PostHog Distinct ID:</strong> {distinctId || 'Loading...'}
        <button
          type="button"
          className="ml-4 rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          Try Again
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full rounded border p-2"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Marking...' : 'Mark as Test User'}
        </button>
      </form>
      {result && <div className="mt-4 text-center">{result}</div>}
    </div>
  )
}
