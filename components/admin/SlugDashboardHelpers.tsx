'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import clsx from 'clsx'
import admin from '@/data/admin.json'
import { H4 } from '@/components/ui/heading'
import { Stack } from '@/components/ui/stack'

export function StatusDot({ subscribed }: { subscribed: boolean }) {
  return (
    <span
      className={clsx(
        'inline-block h-2 w-2 rounded-full',
        subscribed ? 'bg-green-500' : 'bg-amber-500'
      )}
    />
  )
}

export function SocketsDebugPanel({
  debug,
  appointmentsChannel,
}: {
  debug: { channelStatus: string; mode: string; fetchCount: number }
  appointmentsChannel: { status: string; eventCount: number }
}) {
  return (
    <div className="rounded bg-surface-100 p-3 text-xs dark:bg-surface-800">
      <H4 className="mb-1.5" status="muted">
        {admin.slugDashboard.socketsDebugPanel.title}
      </H4>
      <div className="space-y-1 text-accent-500 dark:text-accent-400">
        <Stack direction="row" align="center" gap={2}>
          <StatusDot subscribed={debug.channelStatus === 'SUBSCRIBED'} />
          <span>
            {admin.slugDashboard.socketsDebugPanel.slotHoldsLabel} {debug.channelStatus}
          </span>
          <span>
            {admin.slugDashboard.socketsDebugPanel.separator} {debug.mode}
          </span>
          <span>
            {admin.slugDashboard.socketsDebugPanel.separator} {debug.fetchCount}{' '}
            {admin.slugDashboard.socketsDebugPanel.fetches}
          </span>
        </Stack>
        <Stack direction="row" align="center" gap={2}>
          <StatusDot subscribed={appointmentsChannel.status === 'SUBSCRIBED'} />
          <span>
            {admin.slugDashboard.socketsDebugPanel.appointmentsLabel} {appointmentsChannel.status}
          </span>
          <span>
            {admin.slugDashboard.socketsDebugPanel.separator} {appointmentsChannel.eventCount}{' '}
            {admin.slugDashboard.socketsDebugPanel.eventsReceived}
          </span>
        </Stack>
      </div>
    </div>
  )
}

export function useAppointmentsChannel(onEvent: () => void) {
  const [channel, setChannel] = useState({ status: 'initializing', eventCount: 0 })

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setChannel((s) => ({ ...s, status: 'no_client' }))
      return
    }

    const sub = supabase
      .channel('admin_appointments_watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        setChannel((s) => ({ ...s, eventCount: s.eventCount + 1 }))
        onEvent()
      })
      .subscribe((status, err) => {
        setChannel((s) => ({ ...s, status: err ? `${status}: ${err.message}` : status }))
      })

    return () => {
      sub.unsubscribe()
    }
  }, [onEvent])

  return channel
}
