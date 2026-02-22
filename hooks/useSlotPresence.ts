'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type SlotPresenceState = Record<string, number>

export function useSlotPresence(channelName: string) {
  const [presenceCounts, setPresenceCounts] = useState<SlotPresenceState>({})
  const channelRef = useRef<RealtimeChannel | null>(null)
  const viewingSlotRef = useRef<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const channel = supabase.channel(channelName, {
      config: { presence: { key: crypto.randomUUID() } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const counts: SlotPresenceState = {}

        for (const [, presences] of Object.entries(state)) {
          for (const presence of presences as Array<{ slot?: string }>) {
            if (presence.slot) {
              counts[presence.slot] = (counts[presence.slot] || 0) + 1
            }
          }
        }

        setPresenceCounts(counts)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && viewingSlotRef.current) {
          await channel.track({ slot: viewingSlotRef.current })
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [channelName])

  const trackSlot = useCallback(async (slotId: string | null) => {
    viewingSlotRef.current = slotId
    if (channelRef.current) {
      if (slotId) {
        await channelRef.current.track({ slot: slotId })
      } else {
        await channelRef.current.untrack()
      }
    }
  }, [])

  return { presenceCounts, trackSlot }
}
