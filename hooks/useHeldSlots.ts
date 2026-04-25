'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSessionId } from './useSessionId'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

const POLL_INTERVAL_MS = 5_000

type HeldSlot = {
  start_time: string
  end_time: string
  session_id: string
}

export type HeldSlotsDebug = {
  channelStatus: string
  lastFetchedAt: string | null
  fetchCount: number
  mode: 'realtime' | 'polling'
}

export function useHeldSlots() {
  const [heldSlots, setHeldSlots] = useState<HeldSlot[]>([])
  const [debug, setDebug] = useState<HeldSlotsDebug>({
    channelStatus: 'initializing',
    lastFetchedAt: null,
    fetchCount: 0,
    mode: 'realtime',
  })
  const channelRef = useRef<RealtimeChannel | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setDebug((d) => ({ ...d, channelStatus: 'no_supabase_client' }))
      return
    }

    const fetchActiveHolds = async () => {
      const { data, error } = await supabase
        .from('slot_holds')
        .select('start_time, end_time, session_id')
        .gt('expires_at', new Date().toISOString())

      setHeldSlots(data ?? [])
      setDebug((d) => ({
        ...d,
        lastFetchedAt: new Date().toISOString(),
        fetchCount: d.fetchCount + 1,
        ...(error ? { channelStatus: `fetch_error: ${error.message}` } : {}),
      }))
    }

    const startPolling = () => {
      if (pollRef.current) return
      pollRef.current = setInterval(fetchActiveHolds, POLL_INTERVAL_MS)
      setDebug((d) => ({ ...d, mode: 'polling' }))
    }

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }

    fetchActiveHolds()

    const channel = supabase
      .channel('slot_holds_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slot_holds' }, () => {
        fetchActiveHolds()
      })
      .subscribe((status, err) => {
        setDebug((d) => ({
          ...d,
          channelStatus: err ? `${status}: ${err.message}` : status,
        }))

        if (status === 'SUBSCRIBED') {
          stopPolling()
          setDebug((d) => ({ ...d, mode: 'realtime' }))
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          startPolling()
        }
      })

    channelRef.current = channel

    return () => {
      stopPolling()
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [])

  const sessionId = useSessionId()

  const getHolderSessionId = useCallback(
    (start: string, end: string): string | null => {
      const startMs = new Date(start).getTime()
      const endMs = new Date(end).getTime()
      const hold = heldSlots.find(
        (h) =>
          h.session_id !== sessionId &&
          new Date(h.start_time).getTime() === startMs &&
          new Date(h.end_time).getTime() === endMs
      )
      return hold?.session_id ?? null
    },
    [heldSlots, sessionId]
  )

  return { heldSlots, debug, getHolderSessionId, sessionId }
}
