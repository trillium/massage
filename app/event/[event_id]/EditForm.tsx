'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EditFormProps {
  eventId: string
  token: string
  initialValues: {
    firstName: string
    lastName: string
    phone: string
    location: string
  }
}

export default function EditForm({ eventId, token, initialValues }: EditFormProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [values, setValues] = useState(initialValues)

  async function handleSave() {
    setLoading(true)
    setError(null)

    const changed: Record<string, string> = {}
    for (const key of Object.keys(values) as (keyof typeof values)[]) {
      if (values[key] !== initialValues[key]) {
        changed[key] = values[key]
      }
    }

    if (Object.keys(changed).length === 0) {
      setEditing(false)
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/event/${eventId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, fields: changed }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        setLoading(false)
        return
      }

      setEditing(false)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Edit Info
      </button>
    )
  }

  return (
    <div className="mt-4 space-y-4 rounded-2xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</span>
          <input
            type="text"
            value={values.firstName}
            onChange={(e) => setValues({ ...values, firstName: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</span>
          <input
            type="text"
            value={values.lastName}
            onChange={(e) => setValues({ ...values, lastName: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</span>
        <input
          type="tel"
          value={values.phone}
          onChange={(e) => setValues({ ...values, phone: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</span>
        <input
          type="text"
          value={values.location}
          onChange={(e) => setValues({ ...values, location: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </label>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={() => {
            setValues(initialValues)
            setEditing(false)
            setError(null)
          }}
          disabled={loading}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
