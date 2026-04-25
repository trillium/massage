'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/adminFetch'
import clsx from 'clsx'

interface TimeBlock {
  id: string
  summary: string
  start: { dateTime: string }
  end: { dateTime: string }
}

interface TimeBlockerProps {
  eventContainer: string
}

function roundToNext5Minutes(date: Date): Date {
  const ms = 5 * 60 * 1000
  return new Date(Math.ceil(date.getTime() / ms) * ms)
}

function formatTime(dateTime: string): string {
  return new Date(dateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTimeValue(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export default function TimeBlocker({ eventContainer }: TimeBlockerProps) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  const fetchBlocks = useCallback(async () => {
    setFetching(true)
    try {
      const now = new Date()
      const timeMin = now.toISOString()
      const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const q = encodeURIComponent(`${eventContainer}__EVENT__MEMBER__ [BLOCKED]`)

      const res = await adminFetch(
        `/api/admin/block-time?timeMin=${timeMin}&timeMax=${timeMax}&q=${q}`
      )
      if (!res.ok) return
      const data = await res.json()
      setBlocks(data.blocks ?? [])
    } catch {
      /* silently fail on fetch */
    } finally {
      setFetching(false)
    }
  }, [eventContainer])

  useEffect(() => {
    fetchBlocks()
  }, [fetchBlocks])

  async function createBlock(durationMinutes: number) {
    setLoading(true)
    try {
      const start = roundToNext5Minutes(new Date())
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

      const res = await adminFetch('/api/admin/block-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventContainer,
          date: formatDate(start),
          startTime: formatTimeValue(start),
          endTime: formatTimeValue(end),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create block')
      }

      toast.success(`Blocked ${durationMinutes} minutes`)
      fetchBlocks()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create block')
    } finally {
      setLoading(false)
    }
  }

  async function deleteBlock(eventId: string) {
    try {
      const res = await adminFetch('/api/admin/block-time', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete block')
      }

      toast.success('Block removed')
      setBlocks((prev) => prev.filter((b) => b.id !== eventId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete block')
    }
  }

  return (
    <div className="rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-accent-900 dark:text-accent-100">Block Time</h3>
        <button
          type="button"
          onClick={fetchBlocks}
          disabled={fetching}
          className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400"
        >
          {fetching ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {[15, 30, 60].map((mins) => (
          <button
            key={mins}
            type="button"
            disabled={loading}
            onClick={() => createBlock(mins)}
            className={clsx(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              'border-accent-300 bg-white text-accent-700 hover:bg-accent-50',
              'dark:border-accent-600 dark:bg-surface-700 dark:text-accent-200 dark:hover:bg-surface-600',
              loading && 'cursor-not-allowed opacity-50'
            )}
          >
            {mins < 60 ? `Block ${mins}min` : `Block 1hr`}
          </button>
        ))}
      </div>

      {blocks.length === 0 ? (
        <p className="text-sm text-accent-400">No active blocks</p>
      ) : (
        <ul className="space-y-2">
          {blocks.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded border border-accent-100 bg-white px-3 py-2 text-sm dark:border-accent-600 dark:bg-surface-700"
            >
              <span className="font-medium text-accent-800 dark:text-accent-200">
                {formatTime(b.start.dateTime)} – {formatTime(b.end.dateTime)}
              </span>
              <button
                type="button"
                onClick={() => deleteBlock(b.id)}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
