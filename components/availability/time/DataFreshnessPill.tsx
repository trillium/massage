'use client'

import { useEffect, useRef, useState } from 'react'
import { useReduxAvailability } from '@/redux/hooks'

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ago`
}

function pillColor(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 15) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
  if (seconds < 45)
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
  return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
}

export function DataFreshnessPill() {
  const { slots } = useReduxAvailability()
  const [lastUpdate, setLastUpdate] = useState(Date.now)
  const [elapsed, setElapsed] = useState(0)
  const prevSlotsRef = useRef(slots)

  useEffect(() => {
    if (slots !== prevSlotsRef.current) {
      prevSlotsRef.current = slots
      setLastUpdate(Date.now())
      setElapsed(0)
    }
  }, [slots])

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - lastUpdate)
    }, 1000)
    return () => clearInterval(interval)
  }, [lastUpdate])

  return (
    <span
      className={`absolute -top-3 right-0 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm ${pillColor(elapsed)}`}
    >
      {formatElapsed(elapsed)}
    </span>
  )
}
