'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/adminFetch'

const CONTAINER_OPTIONS = [
  { query: 'free-30', label: 'free-30 (playa-free-30, free-30, westchester-free-30, …)' },
  { query: 'recharge_chair', label: 'recharge_chair (recharge)' },
  { query: '100Devs', label: '100Devs' },
  { query: 'scale23x', label: 'scale23x' },
  { query: 'scale23x_after_hours', label: 'scale23x_after_hours' },
  { query: 'chat', label: 'chat (chat-with-me)' },
  { query: 'the_kinn', label: 'the_kinn' },
]

export default function CreateContainerPage() {
  const [containerQuery, setContainerQuery] = useState(CONTAINER_OPTIONS[0].query)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [titlePrefix, setTitlePrefix] = useState('')
  const [loading, setLoading] = useState(false)

  const containerString = `${containerQuery}__EVENT__CONTAINER__`
  const eventTitle = titlePrefix ? `${titlePrefix} ${containerString}` : containerString
  const canSubmit = date && startTime && endTime && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      const response = await adminFetch('/api/admin/create-container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerQuery, date, startTime, endTime, titlePrefix }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to create container')

      toast.success(
        <div className="space-y-1">
          <div>Container created!</div>
          <div className="flex gap-3">
            <a
              href={result.event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Open in Calendar
            </a>
            <a
              href="/admin/active-event-containers"
              className="text-blue-600 underline hover:text-blue-800"
            >
              View all containers
            </a>
          </div>
        </div>
      )
      setDate('')
      setStartTime('')
      setEndTime('')
      setTitlePrefix('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl p-4 lg:p-6">
      <h1 className="mb-6 text-2xl font-bold text-accent-900 dark:text-accent-100">
        Create Event Container
      </h1>

      <div className="space-y-4 rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-800">
        <div>
          <label
            htmlFor="containerQuery"
            className="mb-1 block text-sm font-medium text-accent-700 dark:text-accent-300"
          >
            Container
          </label>
          <select
            id="containerQuery"
            value={containerQuery}
            onChange={(e) => setContainerQuery(e.target.value)}
            className="w-full rounded-md border border-accent-300 px-3 py-2 text-sm dark:border-accent-600 dark:bg-surface-800 dark:text-accent-100"
          >
            {CONTAINER_OPTIONS.map((opt) => (
              <option key={opt.query} value={opt.query}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="date"
            className="mb-1 block text-sm font-medium text-accent-700 dark:text-accent-300"
          >
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-accent-300 px-3 py-2 text-sm dark:border-accent-600 dark:bg-surface-800 dark:text-accent-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="startTime"
              className="mb-1 block text-sm font-medium text-accent-700 dark:text-accent-300"
            >
              Start (LA time)
            </label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-md border border-accent-300 px-3 py-2 text-sm dark:border-accent-600 dark:bg-surface-800 dark:text-accent-100"
            />
          </div>
          <div>
            <label
              htmlFor="endTime"
              className="mb-1 block text-sm font-medium text-accent-700 dark:text-accent-300"
            >
              End (LA time)
            </label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-md border border-accent-300 px-3 py-2 text-sm dark:border-accent-600 dark:bg-surface-800 dark:text-accent-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="titlePrefix"
            className="mb-1 block text-sm font-medium text-accent-700 dark:text-accent-300"
          >
            Title prefix{' '}
            <span className="font-normal text-accent-500 dark:text-accent-400">(optional)</span>
          </label>
          <input
            id="titlePrefix"
            type="text"
            value={titlePrefix}
            onChange={(e) => setTitlePrefix(e.target.value)}
            placeholder="e.g. Morning session"
            className="w-full rounded-md border border-accent-300 px-3 py-2 text-sm dark:border-accent-600 dark:bg-surface-800 dark:text-accent-100"
          />
        </div>

        <div className="rounded-md border border-accent-200 bg-accent-50 px-3 py-2 text-sm dark:border-accent-700 dark:bg-surface-900">
          <span className="text-accent-500 dark:text-accent-400">Event title: </span>
          <span className="font-mono text-accent-900 dark:text-accent-100">{eventTitle}</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-surface-300 dark:disabled:bg-surface-600"
        >
          {loading ? 'Creating…' : 'Create Container'}
        </button>
      </div>
    </div>
  )
}
