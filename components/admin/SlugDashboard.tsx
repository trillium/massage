'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHeldSlots } from 'hooks/useHeldSlots'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { formatLocalTime } from 'lib/availability/helpers'
import AdminNotesModal from '@/components/admin/AdminNotesModal'
import TimeBlocker from '@/components/admin/TimeBlocker'
import clsx from 'clsx'

interface Appointment {
  id: string
  client_first_name: string
  client_last_name: string
  client_email: string
  client_phone: string | null
  start_time: string
  end_time: string
  duration_minutes: number
  status: string
  promo: string | null
  location: string | null
  admin_notes: string | null
  created_at: string
}

interface SlugDashboardProps {
  slug: string
  appointments: Appointment[]
  eventContainer: string | null
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

export default function SlugDashboard({ slug, appointments, eventContainer }: SlugDashboardProps) {
  const router = useRouter()
  const { heldSlots, debug, activeUsers } = useHeldSlots()
  const [expanded, setExpanded] = useState(true)

  const [appointmentsChannel, setAppointmentsChannel] = useState({
    status: 'initializing',
    eventCount: 0,
  })

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setAppointmentsChannel((s) => ({ ...s, status: 'no_client' }))
      return
    }

    const channel = supabase
      .channel('admin_appointments_watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        setAppointmentsChannel((s) => ({ ...s, eventCount: s.eventCount + 1 }))
        router.refresh()
      })
      .subscribe((status, err) => {
        setAppointmentsChannel((s) => ({
          ...s,
          status: err ? `${status}: ${err.message}` : status,
        }))
      })

    return () => {
      channel.unsubscribe()
    }
  }, [router])

  const activeAppointments = appointments.filter(
    (a) => a.status !== 'cancelled'
  )

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-accent-900 dark:text-accent-100">
          {slug}
        </h2>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-sm text-accent-500 hover:text-accent-700 dark:hover:text-accent-300"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm text-accent-600 dark:text-accent-400">
        <span className="flex items-center gap-1.5">
          <span
            className={clsx(
              'inline-block h-2 w-2 rounded-full',
              debug.channelStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-amber-500'
            )}
          />
          {debug.mode === 'realtime' ? 'Live' : 'Polling'}
        </span>
        <span className="font-medium">
          {Math.max(0, activeUsers - 1)} active {activeUsers - 1 === 1 ? 'user' : 'users'}
        </span>
      </div>

      {expanded && (
        <div className="grid gap-4 md:grid-cols-2">
          <HoldsPanel heldSlots={heldSlots} />
          <AppointmentsPanel
            appointments={activeAppointments}
            onRefresh={() => router.refresh()}
          />
          {eventContainer && <TimeBlocker eventContainer={eventContainer} />}
        </div>
      )}

      <div className="rounded bg-surface-100 p-3 text-xs dark:bg-surface-800">
        <h4 className="mb-1.5 font-semibold text-accent-600 dark:text-accent-400">Sockets</h4>
        <div className="space-y-1 text-accent-500 dark:text-accent-400">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-block h-2 w-2 rounded-full',
                debug.channelStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-amber-500'
              )}
            />
            <span>slot_holds: {debug.channelStatus}</span>
            <span>· {debug.mode}</span>
            <span>· {debug.fetchCount} fetches</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-block h-2 w-2 rounded-full',
                appointmentsChannel.status === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-amber-500'
              )}
            />
            <span>appointments: {appointmentsChannel.status}</span>
            <span>· {appointmentsChannel.eventCount} events received</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HoldsPanel({
  heldSlots,
}: {
  heldSlots: { start_time: string; end_time: string; session_id: string; shoo_count: number }[]
}) {
  return (
    <div className="rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-800">
      <div className="mb-3">
        <h3 className="font-semibold text-accent-900 dark:text-accent-100">
          Active Holds ({heldSlots.length})
        </h3>
      </div>

      {heldSlots.length === 0 ? (
        <p className="text-sm text-accent-400">No active holds</p>
      ) : (
        <ul className="space-y-2">
          {heldSlots.map((h) => (
            <li
              key={h.session_id + h.start_time}
              className="flex items-center justify-between rounded border border-accent-100 bg-white px-3 py-2 text-sm dark:border-accent-600 dark:bg-surface-700"
            >
              <span className="font-medium text-accent-800 dark:text-accent-200">
                {formatLocalTime(h.start_time)} – {formatLocalTime(h.end_time)}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-accent-400">
                  {h.session_id.slice(0, 8)}
                </span>
                {h.shoo_count > 0 && (
                  <span className="rounded bg-red-100 px-1.5 text-xs text-red-700 dark:bg-red-900 dark:text-red-300">
                    shoo: {h.shoo_count}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AppointmentsPanel({
  appointments,
  onRefresh,
}: {
  appointments: Appointment[]
  onRefresh: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  const editingAppointment = sorted.find((a) => a.id === editingId)

  return (
    <div className="rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-accent-900 dark:text-accent-100">
          Appointments ({sorted.length})
        </h3>
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400"
        >
          Refresh
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-accent-400">No appointments yet</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((a) => (
            <li
              key={a.id}
              onClick={() => setEditingId(a.id)}
              className="cursor-pointer rounded border border-accent-100 bg-white px-3 py-2 transition-colors hover:border-primary-300 hover:bg-primary-50/30 dark:border-accent-600 dark:bg-surface-700 dark:hover:border-primary-600 dark:hover:bg-primary-900/20"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-accent-800 dark:text-accent-200">
                  {a.client_first_name} {a.client_last_name.charAt(0)}.
                </span>
                <span
                  className={clsx(
                    'rounded px-1.5 py-0.5 text-xs font-medium',
                    STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-600'
                  )}
                >
                  {a.status}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-accent-500 dark:text-accent-400">
                <span>
                  {formatLocalTime(a.start_time)} – {formatLocalTime(a.end_time)}
                </span>
                <span>{a.duration_minutes}min</span>
                {a.promo && (
                  <span className="rounded bg-purple-100 px-1.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {a.promo}
                  </span>
                )}
              </div>
              {a.admin_notes && (
                <p className="mt-1 truncate text-xs text-accent-500 dark:text-accent-400">
                  {a.admin_notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <AdminNotesModal
        open={editingId !== null}
        onClose={() => setEditingId(null)}
        onSaved={onRefresh}
        appointment={editingAppointment ?? null}
      />
    </div>
  )
}
