'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/adminFetch'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

import { RAFFLE_INTEREST_LABELS } from '@/lib/schema'
import { H2, H3 } from '@/components/ui/heading'
import { TextSm, TextSmMuted, TextLg, TextXsMedium, TextXsMuted } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'

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
  const [status, setStatus] = useState(raffle.status)
  const [isActive, setIsActive] = useState(raffle.is_active)
  const winner = entryList.find((e) => e.is_winner) ?? null

  useEffect(() => {
    setEntryList(initialEntries)
    setStatus(raffle.status)
    setIsActive(raffle.is_active)
  }, [initialEntries, raffle.status, raffle.is_active])

  const [confirmDialog, setConfirmDialog] = useState<{
    title: string
    message: string
    confirmLabel: string
    confirmClassName?: string
    onConfirm: () => void
  } | null>(null)

  const isDrawn = status === 'drawn'

  const showConfirm = useCallback(
    (opts: {
      title: string
      message: string
      confirmLabel: string
      confirmClassName?: string
      onConfirm: () => void
    }) => {
      setConfirmDialog(opts)
    },
    []
  )

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
      setEntryList((prev) => prev.map((e) => ({ ...e, is_winner: e.email === data.winner.email })))
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

  const handleRedraw = () => {
    showConfirm({
      title: 'Redraw Winner',
      message: 'This will clear the current winner and draw a new one.',
      confirmLabel: 'Redraw',
      confirmClassName: 'bg-amber-500 hover:bg-amber-600 text-white',
      onConfirm: () => handleDraw(),
    })
  }

  const handleClearWinner = () => {
    showConfirm({
      title: 'Clear Winner',
      message: 'The raffle will reopen with no winner.',
      confirmLabel: 'Clear Winner',
      onConfirm: async () => {
        try {
          const res = await adminFetch(`/api/admin/raffle/${raffle.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clear_winner: true }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          setStatus('open')
          setEntryList((prev) => prev.map((e) => ({ ...e, is_winner: false })))
          toast.success('Winner cleared, raffle reopened')
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Failed to clear winner')
        }
      },
    })
  }

  const handlePickWinner = (entry: RaffleEntry) => {
    showConfirm({
      title: 'Pick as Winner',
      message: `Pick ${entry.name} as the winner? This will clear any existing winner.`,
      confirmLabel: 'Pick Winner',
      confirmClassName: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      onConfirm: async () => {
        try {
          const res = await adminFetch(`/api/admin/raffle/entries/${entry.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pick_as_winner: true }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          setEntryList((prev) => prev.map((e) => ({ ...e, is_winner: e.id === entry.id })))
          setStatus('drawn')
          toast.success(`Winner picked: ${entry.name}`)
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Failed to pick winner')
        }
      },
    })
  }

  const handleDelete = (entryId: string) => {
    showConfirm({
      title: 'Delete Entry',
      message: 'This entry will be permanently removed.',
      confirmLabel: 'Delete',
      confirmClassName: 'bg-red-600 hover:bg-red-700 text-white',
      onConfirm: async () => {
        setDeletingId(entryId)
        try {
          const res = await adminFetch(`/api/admin/raffle/entries/${entryId}`, {
            method: 'DELETE',
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          setEntryList((prev) => prev.filter((e) => e.id !== entryId))
          toast.success('Entry deleted')
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Failed to delete entry')
        } finally {
          setDeletingId(null)
        }
      },
    })
  }

  const cardClass =
    'rounded-lg border border-accent-200 bg-surface-50 p-6 dark:border-accent-700 dark:bg-surface-800'

  return (
    <Stack gap={6}>
      <Box className={cardClass}>
        <Stack direction="row" align="center" justify="between">
          <Box>
            <H2>{raffle.name}</H2>
            <TextXsMuted className="mt-0.5 font-mono">{raffle.id}</TextXsMuted>
            <Stack direction="row" align="center" gap={2} className="mt-1">
              <TextXsMedium
                className="inline-block rounded-full px-3 py-1 ${ isDrawn ? 'bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 dark:bg-green-900/30 dark:text-green-300' }"
                status="success"
              >
                {status}
              </TextXsMedium>
              {isActive && (
                <TextXsMedium
                  className="inline-block rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900/30"
                  status="info"
                >
                  {'active'}
                </TextXsMedium>
              )}
            </Stack>
          </Box>
          <Stack direction="row" align="center" gap={2}>
            {!isActive && (
              <Button
                type="button"
                size="sm"
                onClick={handleSetActive}
                disabled={settingActive}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                {settingActive ? 'Setting…' : 'Set as Active'}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                router.refresh()
                toast.success('Data refreshed')
              }}
            >
              {'Refresh'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Unique Entries" value={stats.uniqueEntries} />
        <StatCard label="Total Submissions" value={stats.totalEntries} />
        <StatCard label="Local %" value={`${stats.localPercent}%`} />
        {Object.entries(stats.interestedInCounts).map(([interest, count]) => (
          <StatCard
            key={interest}
            label={RAFFLE_INTEREST_LABELS[interest] || interest}
            value={count}
          />
        ))}
      </Box>

      <Box className={cardClass}>
        <H3 className="mb-4">{'Entries'}</H3>
        <Box className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-accent-200 dark:border-accent-700">
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  {'Name'}
                </th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  {'Email'}
                </th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  {'Phone'}
                </th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  {'Zip'}
                </th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  {'Interested In'}
                </th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  {'Date'}
                </th>
                <th className="px-3 py-2 font-medium text-accent-500 dark:text-accent-400">
                  {'Exclude'}
                </th>
                <th className="px-3 py-2" />
                <th className="px-3 py-2" />
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
                      ? entry.interested_in.map((i) => RAFFLE_INTEREST_LABELS[i] || i).join(', ')
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-accent-500 dark:text-accent-400">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input // ds-ignore - checkbox; Input component is for text fields
                      type="checkbox"
                      checked={entry.excluded ?? false}
                      disabled={entry.is_winner || togglingExcludeId === entry.id}
                      onChange={() => handleExclude(entry)}
                      className="h-4 w-4 rounded border-accent-300 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-3 py-2">
                    {!entry.is_winner && !entry.excluded && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePickWinner(entry)}
                        className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
                      >
                        {'Pick'}
                      </Button>
                    )}
                    {entry.is_winner && (
                      <TextXsMedium as="span" status="warning">
                        {'Winner'}
                      </TextXsMedium>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
                    >
                      {deletingId === entry.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </td>
                </tr>
              ))}
              {entryList.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-accent-400">
                    {'No entries yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Box>

      {winner && (
        <Box className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-900/20">
          <H3 status="warning">{'Winner'}</H3>
          <TextLg className="mt-2 font-semibold text-yellow-900 dark:text-yellow-100">
            {winner.name}
          </TextLg>
          <TextSm status="warning">{winner.email}</TextSm>
          <TextSm status="warning">{winner.phone}</TextSm>
          {winner.zip_code && <TextSm status="warning">{`Zip: ${winner.zip_code}`}</TextSm>}
          {Array.isArray(winner.interested_in) && winner.interested_in.length > 0 && (
            <TextSm status="warning">
              {winner.interested_in.map((i) => RAFFLE_INTEREST_LABELS[i] || i).join(', ')}
            </TextSm>
          )}
          {isDrawn && (
            <Stack direction="row" gap={3} className="mt-4">
              <Button
                type="button"
                onClick={handleRedraw}
                disabled={drawing}
                className="bg-amber-500 text-white hover:bg-amber-600"
              >
                {drawing ? 'Drawing...' : 'Redraw Winner'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClearWinner}>
                {'Clear Winner'}
              </Button>
            </Stack>
          )}
        </Box>
      )}

      {!isDrawn && (
        <Button type="button" onClick={handleDraw} disabled={drawing || stats.uniqueEntries === 0}>
          {drawing ? 'Drawing...' : 'Draw Winner'}
        </Button>
      )}

      <ConfirmDialog
        open={confirmDialog !== null}
        onClose={() => setConfirmDialog(null)}
        onConfirm={confirmDialog?.onConfirm ?? (() => {})}
        title={confirmDialog?.title ?? ''}
        message={confirmDialog?.message ?? ''}
        confirmLabel={confirmDialog?.confirmLabel}
        confirmClassName={confirmDialog?.confirmClassName}
      />
    </Stack>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Box className="rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-800">
      <TextSmMuted>{label}</TextSmMuted>
      <TextLg className="mt-1 text-2xl font-bold">{value}</TextLg>
    </Box>
  )
}
