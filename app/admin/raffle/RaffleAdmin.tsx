'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/adminFetch'

const INTEREST_LABELS: Record<string, string> = {
  in_home: 'In-home',
  in_office: 'In-office',
}

interface Raffle {
  id: string
  name: string
  status: string
  is_active: boolean
  created_at: string
  drawn_at: string | null
}

interface RaffleEntry {
  id: string
  name: string
  email: string
  phone: string
  zip_code: string | null
  is_local: boolean
  interested_in: string[]
  is_winner: boolean
  excluded: boolean
  created_at: string
}

interface RaffleStats {
  totalEntries: number
  uniqueEntries: number
  localCount: number
  nonLocalCount: number
  localPercent: number
  uniqueLocal: number
  uniqueNonLocal: number
  interestedInCounts: Record<string, number>
}

interface RaffleAdminProps {
  raffle: Raffle
  entries: RaffleEntry[]
  stats: RaffleStats
}

export function RaffleAdmin({ raffle, entries: initialEntries, stats }: RaffleAdminProps) {
  const router = useRouter()
  const [drawing, setDrawing] = useState(false)
  const [settingActive, setSettingActive] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingExcludeId, setTogglingExcludeId] = useState<string | null>(null)
  const [entryList, setEntryList] = useState(initialEntries)
  const [winner, setWinner] = useState<{ name: string; email: string } | null>(() => {
    const existing = initialEntries.find((e) => e.is_winner)
    return existing ? { name: existing.name, email: existing.email } : null
  })
  const [status, setStatus] = useState(raffle.status)
  const [isActive, setIsActive] = useState(raffle.is_active)

  const isDrawn = status === 'drawn'

  const handleSetActive = async () => {
    setSettingActive(true)
    try {
      const res = await adminFetch(`/api/admin/raffle/${raffle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setIsActive(true)
      toast.success(`"${raffle.name}" is now the active raffle`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set active')
    } finally {
      setSettingActive(false)
    }
  }

  const handleDraw = async () => {
    setDrawing(true)
    try {
      const res = await adminFetch('/api/admin/raffle/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raffle_id: raffle.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setWinner(data.winner)
      setStatus('drawn')
      toast.success(`Winner drawn: ${data.winner.name}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to draw winner')
    } finally {
      setDrawing(false)
    }
  }

  const handleExclude = async (entry: RaffleEntry) => {
    const newExcluded = !(entry.excluded ?? false)
    setTogglingExcludeId(entry.id)
    setEntryList((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, excluded: newExcluded } : e))
    )
    try {
      const res = await adminFetch(`/api/admin/raffle/entries/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excluded: newExcluded }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEntryList((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, excluded: !newExcluded } : e))
        )
        throw new Error(data.error)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update entry')
    } finally {
      setTogglingExcludeId(null)
    }
  }

  const handleRedraw = async () => {
    if (!window.confirm('Redraw winner? This will clear the current winner.')) return
    await handleDraw()
  }

  const handleClearWinner = async () => {
    if (!window.confirm('Clear the winner? Raffle will reopen with no winner.')) return
    try {
      const res = await adminFetch(`/api/admin/raffle/${raffle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear_winner: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setWinner(null)
      setStatus('open')
      setEntryList((prev) => prev.map((e) => ({ ...e, is_winner: false })))
      toast.success('Winner cleared, raffle reopened')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to clear winner')
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!window.confirm('Delete this entry?')) return
    setDeletingId(entryId)
    try {
      const res = await adminFetch(`/api/admin/raffle/entries/${entryId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEntryList((prev) => prev.filter((e) => e.id !== entryId))
      toast.success('Entry deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete entry')
    } finally {
      setDeletingId(null)
    }
  }

  const cardClass =
    'rounded-lg border border-accent-200 bg-surface-50 p-6 dark:border-accent-700 dark:bg-surface-800'

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-accent-900 dark:text-accent-100">
              {raffle.name}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-accent-400 dark:text-accent-500">
              {raffle.id}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  isDrawn
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                }`}
              >
                {status}
              </span>
              {isActive && (
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  active
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isActive && (
              <button
                onClick={handleSetActive}
                disabled={settingActive}
                className="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:bg-surface-300 dark:disabled:bg-surface-600"
              >
                {settingActive ? 'Setting…' : 'Set as Active'}
              </button>
            )}
            <button
              onClick={() => {
                router.refresh()
                toast.success('Data refreshed')
              }}
              className="rounded border border-accent-300 px-3 py-1.5 text-sm text-accent-600 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-400 dark:hover:bg-surface-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Unique Entries" value={stats.uniqueEntries} />
        <StatCard label="Total Submissions" value={stats.totalEntries} />
        <StatCard label="Local %" value={`${stats.localPercent}%`} />
        {Object.entries(stats.interestedInCounts).map(([interest, count]) => (
          <StatCard key={interest} label={INTEREST_LABELS[interest] || interest} value={count} />
        ))}
      </div>

      <div className={cardClass}>
        <h3 className="mb-4 text-lg font-semibold text-accent-900 dark:text-accent-100">Entries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-accent-200 dark:border-accent-700">
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">Name</th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  Email
                </th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  Phone
                </th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">Zip</th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  Interested In
                </th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">Date</th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  Exclude
                </th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {entryList.map((entry) => (
                <tr
                  key={entry.id}
                  className={`border-b border-accent-100 dark:border-accent-800 ${entry.is_winner ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''} ${entry.excluded ? 'opacity-50' : ''}`}
                >
                  <td className="px-3 py-2 text-accent-900 dark:text-accent-100">{entry.name}</td>
                  <td className="px-3 py-2">{entry.email}</td>
                  <td className="px-3 py-2">{entry.phone}</td>
                  <td className="px-3 py-2">{entry.zip_code || '—'}</td>
                  <td className="px-3 py-2">
                    {Array.isArray(entry.interested_in)
                      ? entry.interested_in.map((i) => INTEREST_LABELS[i] || i).join(', ')
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-accent-500 dark:text-accent-400">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={entry.excluded ?? false}
                      disabled={entry.is_winner || togglingExcludeId === entry.id}
                      onChange={() => handleExclude(entry)}
                      className="h-4 w-4 rounded border-accent-300 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50 dark:text-red-500 dark:hover:text-red-400"
                    >
                      {deletingId === entry.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {entryList.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-accent-400">
                    No entries yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {winner && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-900/20">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Winner</h3>
          <p className="mt-2 text-lg font-semibold text-yellow-900 dark:text-yellow-100">
            {winner.name}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">{winner.email}</p>
          {isDrawn && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleRedraw}
                disabled={drawing}
                className="rounded bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600 disabled:bg-surface-300 dark:disabled:bg-surface-600"
              >
                {drawing ? 'Drawing...' : 'Redraw Winner'}
              </button>
              <button
                onClick={handleClearWinner}
                className="rounded border border-accent-300 px-4 py-2 text-sm text-accent-700 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-700"
              >
                Clear Winner
              </button>
            </div>
          )}
        </div>
      )}

      {!isDrawn && (
        <button
          onClick={handleDraw}
          disabled={drawing || stats.uniqueEntries === 0}
          className="rounded bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 disabled:bg-surface-300 dark:disabled:bg-surface-600"
        >
          {drawing ? 'Drawing...' : 'Draw Winner'}
        </button>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-800">
      <p className="text-sm text-accent-500 dark:text-accent-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-accent-900 dark:text-accent-100">{value}</p>
    </div>
  )
}
