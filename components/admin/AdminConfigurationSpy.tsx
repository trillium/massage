'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectConfig } from '@/redux/slices/configSlice'
import { SlugConfigurationType } from '@/lib/types'
import {
  LEAD_TIME,
  SLOT_PADDING,
  OWNER_TIMEZONE,
  DEFAULT_DURATION,
  ALLOWED_DURATIONS,
} from 'config'

export function AdminConfigurationSpy() {
  const [selectedSlug, setSelectedSlug] = useState('')
  const [availableSlugs, setAvailableSlugs] = useState<string[]>([])
  const [fetchedConfig, setFetchedConfig] = useState<SlugConfigurationType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reduxConfig = useSelector(selectConfig)

  // Fetch available slugs on mount
  useEffect(() => {
    const fetchSlugs = async () => {
      try {
        const response = await fetch('/api/admin/configuration/slugs')
        if (response.ok) {
          const slugs: string[] = await response.json()
          setAvailableSlugs(slugs)
        }
      } catch (err) {
        console.error('Error fetching slugs:', err)
      }
    }
    fetchSlugs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const slug = selectedSlug
    if (!slug) return

    setLoading(true)
    setError(null)
    setFetchedConfig(null)

    try {
      const response = await fetch(`/api/admin/configuration/${encodeURIComponent(slug)}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const config: SlugConfigurationType = await response.json()
      setFetchedConfig(config)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Configuration Spy</h2>

      {/* Slug Select Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="flex-1 rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
          disabled={loading}
        >
          <option value="">Select a booking slug</option>
          {availableSlugs.map((slug) => (
            <option key={slug} value={slug}>
              {slug}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !selectedSlug}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Config'}
        </button>
      </form>

      {/* Global Constants */}
      <div className="mb-6 space-y-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Global Constants</h3>
        <div>
          <strong>LEAD_TIME:</strong> {LEAD_TIME} minutes ({LEAD_TIME / 60} hours)
        </div>
        <div>
          <strong>SLOT_PADDING:</strong> {SLOT_PADDING} minutes
        </div>
        <div>
          <strong>OWNER_TIMEZONE:</strong> {OWNER_TIMEZONE}
        </div>
        <div>
          <strong>DEFAULT_DURATION:</strong> {DEFAULT_DURATION} minutes
        </div>
        <div>
          <strong>ALLOWED_DURATIONS:</strong> {ALLOWED_DURATIONS.join(', ')} minutes
        </div>
      </div>

      {/* Current Redux Configuration */}
      <div className="mb-6 space-y-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          Current Redux Configuration
        </h3>
        <div>
          <strong>leadTimeMinimum:</strong>{' '}
          {reduxConfig.leadTimeMinimum ?? 'Not set (uses LEAD_TIME)'} minutes
        </div>
        <div>
          <strong>allowedDurations:</strong>{' '}
          {reduxConfig.allowedDurations?.join(', ') ?? 'Not set (uses ALLOWED_DURATIONS)'}
        </div>
        <div>
          <strong>instantConfirm:</strong> {reduxConfig.instantConfirm ? 'Yes' : 'No'}
        </div>
        {/* Add more fields as needed */}
        <details className="mt-4">
          <summary className="cursor-pointer font-medium">Full Redux Configuration Object</summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-700">
            {JSON.stringify(reduxConfig, null, 2)}
          </pre>
        </details>
      </div>

      {/* Loading */}
      {loading && <div className="text-blue-600 dark:text-blue-400">Loading configuration...</div>}

      {/* Error */}
      {error && <div className="text-red-600 dark:text-red-400">Error: {error}</div>}

      {/* Fetched Configuration */}
      {fetchedConfig && selectedSlug && (
        <div className="space-y-2 border-t pt-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            Configuration for Slug: {selectedSlug}
          </h3>
          <div>
            <strong>leadTimeMinimum:</strong>{' '}
            {fetchedConfig.leadTimeMinimum ?? 'Not set (uses LEAD_TIME)'} minutes
          </div>
          <div>
            <strong>allowedDurations:</strong>{' '}
            {fetchedConfig.allowedDurations?.join(', ') ?? 'Not set (uses ALLOWED_DURATIONS)'}
          </div>
          <div>
            <strong>instantConfirm:</strong> {fetchedConfig.instantConfirm ? 'Yes' : 'No'}
          </div>
          {/* Add more fields as needed */}
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Full Configuration Object</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-700">
              {JSON.stringify(fetchedConfig, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
