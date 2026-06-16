/* ds-ignore-file */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHeldSlots } from 'hooks/useHeldSlots'
import { formatLocalTime } from 'lib/availability/helpers'
import AdminNotesModal from '@/components/admin/AdminNotesModal'
import TimeBlocker from '@/components/admin/TimeBlocker'
import clsx from 'clsx'
import { Appointment, STATUS_STYLES } from '@/components/admin/appointmentTypes'
import {
  StatusDot,
  SocketsDebugPanel,
  useAppointmentsChannel,
} from '@/components/admin/SlugDashboardHelpers'
import { H2, H3 } from '@/components/ui/heading'
import { TextSmMuted, TextXs, TextXsMuted } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface SlugDashboardProps {
  slug: string
  appointments: Appointment[]
  eventContainer: string | null
}

export default function SlugDashboard({ slug, appointments, eventContainer }: SlugDashboardProps) {
  const router = useRouter()
  const { heldSlots, debug, activeUsers } = useHeldSlots('SlugDashboard')
  const [expanded, setExpanded] = useState(true)

  const appointmentsChannel = useAppointmentsChannel(router.refresh)
  const activeAppointments = appointments.filter((a) => a.status !== 'cancelled')

  return (
    <Box className="mb-8 space-y-4">
      <Stack direction="row" align="center" justify="between">
        <H2>{slug}</H2>
        <Button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-sm text-accent-500 hover:text-accent-700 dark:hover:text-accent-300"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </Stack>

      <Stack
        className="text-sm text-accent-600 dark:text-accent-400"
        direction="row"
        align="center"
        gap={4}
      >
        <span className="flex items-center gap-1.5">
          <StatusDot subscribed={debug.channelStatus === 'SUBSCRIBED'} />
          {debug.mode === 'realtime' ? 'Live' : 'Polling'}
        </span>
        <span className="font-medium">
          {Math.max(0, activeUsers - 1)} active {activeUsers - 1 === 1 ? 'user' : 'users'}
        </span>
      </Stack>

      {expanded && (
        <Box className="grid gap-4 md:grid-cols-2">
          <HoldsPanel heldSlots={heldSlots} />
          <AppointmentsPanel appointments={activeAppointments} onRefresh={router.refresh} />
          {eventContainer && <TimeBlocker eventContainer={eventContainer} />}
        </Box>
      )}

      <SocketsDebugPanel debug={debug} appointmentsChannel={appointmentsChannel} />
    </Box>
  )
}

function HoldsPanel({
  heldSlots,
}: {
  heldSlots: { start_time: string; end_time: string; session_id: string; shoo_count: number }[]
}) {
  return (
    <Box className="rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-800">
      <Box className="mb-3">
        <H3>Active Holds ({heldSlots.length})</H3>
      </Box>

      {heldSlots.length === 0 ? (
        <TextSmMuted>No active holds</TextSmMuted>
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
                <TextXsMuted className="font-mono">{h.session_id.slice(0, 8)}</TextXsMuted>
                {h.shoo_count > 0 && (
                  <TextXs className="rounded bg-red-100 px-1.5 dark:bg-red-900" status="error">
                    shoo: {h.shoo_count}
                  </TextXs>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Box>
  )
}

function AppointmentRow({
  appointment,
  onClick,
}: {
  appointment: Appointment
  onClick: () => void
}) {
  const a = appointment
  return (
    <li
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      className="cursor-pointer rounded border border-accent-100 bg-white px-3 py-2 transition-colors hover:border-primary-300 hover:bg-primary-50/30 dark:border-accent-600 dark:bg-surface-700 dark:hover:border-primary-600 dark:hover:bg-primary-900/20"
    >
      <Stack direction="row" align="center" justify="between">
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
      </Stack>
      <Stack
        className="mt-1 text-sm text-accent-500 dark:text-accent-400"
        direction="row"
        align="center"
        gap={3}
      >
        <span>
          {formatLocalTime(a.start_time)} – {formatLocalTime(a.end_time)}
        </span>
        <span>{a.duration_minutes}min</span>
        {a.promo && (
          <TextXs className="rounded bg-purple-100 px-1.5 dark:bg-purple-900">{a.promo}</TextXs>
        )}
      </Stack>
      {a.admin_notes && <TextXsMuted className="mt-1 truncate">{a.admin_notes}</TextXsMuted>}
    </li>
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

  const editingAppointment = sorted.find((a) => a.id === editingId) ?? null

  return (
    <Box className="rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-800">
      <Stack className="mb-3" direction="row" align="center" justify="between">
        <H3>Appointments ({sorted.length})</H3>
        <Button
          type="button"
          onClick={onRefresh}
          className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400"
        >
          Refresh
        </Button>
      </Stack>

      {sorted.length === 0 ? (
        <TextSmMuted>No appointments yet</TextSmMuted>
      ) : (
        <ul className="space-y-2">
          {sorted.map((a) => (
            <AppointmentRow key={a.id} appointment={a} onClick={() => setEditingId(a.id)} />
          ))}
        </ul>
      )}

      <AdminNotesModal
        open={editingId !== null}
        onClose={() => setEditingId(null)}
        onSaved={onRefresh}
        onDeleted={onRefresh}
        appointment={editingAppointment}
      />
    </Box>
  )
}
