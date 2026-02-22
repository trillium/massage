'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { setSlots } from '@/redux/slices/availabilitySlice'
import { createSlots } from '@/lib/availability/createSlots'
import { LEAD_TIME } from 'config'
import type { DayWithStartEnd, StringInterval } from '@/lib/types'

const COOLDOWN_MS = 15_000
const BACKGROUND_INTERVAL_MS = 30_000

type SmartRefreshConfig = {
  start: DayWithStartEnd
  end: DayWithStartEnd
  duration: number
  leadTime?: number
}

async function fetchBusyTimes(): Promise<StringInterval[] | null> {
  try {
    const res = await fetch('/api/availability')
    if (!res.ok) return null
    const data: { busy: StringInterval[] } = await res.json()
    return data.busy
  } catch {
    return null
  }
}

export function useSmartRefresh({
  start,
  end,
  duration,
  leadTime = LEAD_TIME,
}: SmartRefreshConfig) {
  const dispatch = useAppDispatch()
  const lastFetchRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const refresh = useCallback(async () => {
    const now = Date.now()
    if (now - lastFetchRef.current < COOLDOWN_MS) return
    lastFetchRef.current = now

    const busy = await fetchBusyTimes()
    if (!busy) return

    const newSlots = createSlots({ duration, leadTime, start, end, busy })
    dispatch(setSlots(newSlots))
  }, [dispatch, duration, leadTime, start, end])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('touchstart', refresh, { passive: true })

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, BACKGROUND_INTERVAL_MS)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.removeEventListener('touchstart', refresh)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [refresh])

  return { refresh }
}
