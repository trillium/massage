'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSessionId } from './useSessionId'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { debugLog } from '@/lib/debug/log'
import type { RealtimeChannel } from '@supabase/supabase-js'

const POLL_INTERVAL_MS = 5_000
const ORPHAN_LEAVE_DEBOUNCE_MS = 2_500

type HeldSlot = {
  start_time: string
  end_time: string
  session_id: string
  shoo_count: number
  expires_at: string
}

export type HeldSlotsDebug = {
  channelStatus: string
  lastFetchedAt: string | null
  fetchCount: number
  mode: 'realtime' | 'polling'
}

export function useHeldSlots() {
  const sessionId = useSessionId()
  const [heldSlots, setHeldSlots] = useState<HeldSlot[]>([])
  const [activeUsers, setActiveUsers] = useState(0)
  const [debug, setDebug] = useState<HeldSlotsDebug>({
    channelStatus: 'initializing',
    lastFetchedAt: null,
    fetchCount: 0,
    mode: 'realtime',
  })
  const channelRef = useRef<RealtimeChannel | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const heldSlotsRef = useRef<HeldSlot[]>([])
  const leaveDebounceRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const expiryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setDebug((d) => ({ ...d, channelStatus: 'no_supabase_client' }))
      debugLog('held_slots:no_client', { sessionId })
      return
    }

    const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'public'

    const releaseOrphanedHold = (orphanSessionId: string) => {
      debugLog('held_slots:orphan_cleanup', { sessionId, orphanSessionId })
      fetch('/api/release-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: orphanSessionId }),
      }).catch(() => {})
    }

    const checkOrphanedHolds = (presenceKeys: string[]) => {
      const keySet = new Set(presenceKeys)
      for (const hold of heldSlotsRef.current) {
        if (!keySet.has(hold.session_id)) {
          releaseOrphanedHold(hold.session_id)
        }
      }
    }

    const clearExpiryTimers = () => {
      for (const t of expiryTimersRef.current) {
        clearTimeout(t)
      }
      expiryTimersRef.current = []
    }

    const fetchActiveHolds = async () => {
      const { data, error } = await supabase
        .from('slot_holds')
        .select('start_time, end_time, session_id, shoo_count, expires_at')
        .gt('expires_at', new Date().toISOString())

      if (!error) {
        const holds = data ?? []
        setHeldSlots(holds)
        heldSlotsRef.current = holds

        clearExpiryTimers()
        for (const hold of holds) {
          const timeUntilExpiry = new Date(hold.expires_at).getTime() - Date.now()
          if (timeUntilExpiry > 0) {
            const t = setTimeout(() => fetchActiveHolds(), timeUntilExpiry)
            expiryTimersRef.current.push(t)
          }
        }
      }
      setDebug((d) => ({
        ...d,
        lastFetchedAt: new Date().toISOString(),
        fetchCount: d.fetchCount + 1,
        ...(error ? { channelStatus: `fetch_error: ${error.message}` } : {}),
      }))
      debugLog('held_slots:fetched', {
        sessionId,
        tenant: tenantSlug,
        count: data?.length ?? 0,
        error: error?.message,
        holds: data?.map((h) => ({ start: h.start_time, session: h.session_id })),
      })
    }

    const startPolling = () => {
      if (pollRef.current) return
      pollRef.current = setInterval(fetchActiveHolds, POLL_INTERVAL_MS)
      setDebug((d) => ({ ...d, mode: 'polling' }))
      debugLog('held_slots:polling_started', { sessionId })
    }

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }

    fetchActiveHolds()

    const channelName = `${tenantSlug}:slot_holds_changes`
    const channel = supabase
      .channel(channelName, {
        config: { presence: { key: sessionId ?? crypto.randomUUID() } },
      })
      .on(
        'postgres_changes',
        { event: '*', schema: tenantSlug, table: 'slot_holds' },
        (payload) => {
          debugLog('held_slots:realtime_event', {
            sessionId,
            tenant: tenantSlug,
            eventType: payload.eventType,
            table: payload.table,
            schema: payload.schema,
          })
          fetchActiveHolds()
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const presenceKeys = Object.keys(state)
        setActiveUsers(presenceKeys.length)
        debugLog('held_slots:presence_sync', { sessionId, activeUsers: presenceKeys.length })
        checkOrphanedHolds(presenceKeys)
      })
      .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
        const existing = leaveDebounceRef.current.get(key)
        if (existing) clearTimeout(existing)
        const t = setTimeout(() => {
          leaveDebounceRef.current.delete(key)
          const hasOrphanedHold = heldSlotsRef.current.some((h) => h.session_id === key)
          if (hasOrphanedHold) {
            releaseOrphanedHold(key)
          }
        }, ORPHAN_LEAVE_DEBOUNCE_MS)
        leaveDebounceRef.current.set(key, t)
      })
      .subscribe(async (status, err) => {
        setDebug((d) => ({
          ...d,
          channelStatus: err ? `${status}: ${err.message}` : status,
        }))
        debugLog('held_slots:channel_status', {
          sessionId,
          tenant: tenantSlug,
          channel: channelName,
          status,
          error: err?.message,
        })

        if (status === 'SUBSCRIBED') {
          stopPolling()
          setDebug((d) => ({ ...d, mode: 'realtime' }))
          await channel.track({ online_at: new Date().toISOString() })
          const state = channel.presenceState()
          checkOrphanedHolds(Object.keys(state))
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          startPolling()
        }
      })

    channelRef.current = channel

    return () => {
      stopPolling()
      clearExpiryTimers()
      for (const t of leaveDebounceRef.current.values()) {
        clearTimeout(t)
      }
      leaveDebounceRef.current.clear()
      channel.unsubscribe()
      channelRef.current = null
      debugLog('held_slots:unmount', { sessionId })
    }
  }, [sessionId])

  const getHolderSessionId = useCallback(
    (start: string, end: string): string | null => {
      const startMs = new Date(start).getTime()
      const endMs = new Date(end).getTime()
      const hold = heldSlots.find(
        (h) =>
          h.session_id !== sessionId &&
          new Date(h.start_time).getTime() < endMs &&
          new Date(h.end_time).getTime() > startMs
      )
      return hold?.session_id ?? null
    },
    [heldSlots, sessionId]
  )

  const getShooCount = useCallback(
    (start: string, end: string): number => {
      const startMs = new Date(start).getTime()
      const endMs = new Date(end).getTime()
      const hold = heldSlots.find(
        (h) =>
          h.session_id !== sessionId &&
          new Date(h.start_time).getTime() < endMs &&
          new Date(h.end_time).getTime() > startMs
      )
      return hold?.shoo_count ?? 0
    },
    [heldSlots, sessionId]
  )

  return { heldSlots, debug, activeUsers, getHolderSessionId, getShooCount, sessionId }
}
