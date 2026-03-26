'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type HeldSlot = {
  start_time: string
  end_time: string
  session_id: string
}

export function useHeldSlots() {
  const [heldSlots, setHeldSlots] = useState<HeldSlot[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    async function fetchActiveHolds() {
      const { data } = await supabase
        .from('slot_holds')
        .select('start_time, end_time, session_id')
        .gt('expires_at', new Date().toISOString())

      setHeldSlots(data ?? [])
    }

    fetchActiveHolds()

    const channel = supabase
      .channel('slot_holds_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slot_holds' }, () => {
        fetchActiveHolds()
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [])

  return heldSlots
}
