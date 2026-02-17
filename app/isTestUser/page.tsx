'use client'
import { useState, useEffect } from 'react'
import { markUserAsTestUser, getDistinctId, identifyUser } from '@/lib/posthog-utils'

export default function IsTestUserPage() {
  const [userId, setUserId] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [distinctId, setDistinctId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [action, setAction] = useState<'identify' | 'testUser'>('identify')

  useEffect(() => {
    const distinctId = getDistinctId()
    setDistinctId(distinctId)
    setUserId(distinctId || '')
  }, [refreshKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      let result
      if (action === 'testUser') {
        result = await markUserAsTestUser(userId)
      } else {
        result = await identifyUser(userId)
      }
      setResult(result.message)
    } catch (err) {
      console.error('[PostHog Error]', err)
      setResult('Error with PostHog operation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded bg-white p-6 shadow dark:bg-gray-800">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        PostHog User Management
      </h1>
      <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
        <strong>PostHog Distinct ID:</strong> {distinctId || 'Loading...'}
        <button
          type="button"
          className="ml-4 rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          Try Again
        </button>
      </div>

      <div className="mb-4">
        <div className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Action:
        </div>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="action"
              value="identify"
              checked={action === 'identify'}
              onChange={(e) => setAction(e.target.value as 'identify' | 'testUser')}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Identify User (userId or email)
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="action"
              value="testUser"
              checked={action === 'testUser'}
              onChange={(e) => setAction(e.target.value as 'identify' | 'testUser')}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">Mark as Test User</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full rounded border border-gray-300 p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          placeholder={action === 'identify' ? 'Enter User ID or Email' : 'Enter User ID'}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
          disabled={loading}
        >
          {loading
            ? action === 'identify'
              ? 'Identifying...'
              : 'Marking...'
            : action === 'identify'
              ? 'Identify User'
              : 'Mark as Test User'}
        </button>
      </form>
      {result && <div className="mt-4 text-center text-gray-700 dark:text-gray-300">{result}</div>}
    </div>
  )
}
