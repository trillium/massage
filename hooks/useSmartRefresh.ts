'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const COOLDOWN_MS = 15_000
const BACKGROUND_INTERVAL_MS = 30_000

export function useSmartRefresh() {
  const router = useRouter()
  const lastRefreshRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const refresh = useCallback(() => {
    const now = Date.now()
    if (now - lastRefreshRef.current < COOLDOWN_MS) return
    lastRefreshRef.current = now
    router.refresh()
  }, [router])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('touchstart', refresh, { passive: true })

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, BACKGROUND_INTERVAL_MS)

    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      ?.channel('appointments_refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        refresh()
      })
      .subscribe()

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.removeEventListener('touchstart', refresh)
      if (intervalRef.current) clearInterval(intervalRef.current)
      channel?.unsubscribe()
    }
  }, [refresh])

  return { refresh }
}
