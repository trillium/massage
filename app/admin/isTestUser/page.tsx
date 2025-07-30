'use client'
import { useState } from 'react'

export default function IsTestUserPage() {
  const [userId, setUserId] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
