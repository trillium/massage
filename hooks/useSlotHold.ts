'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSessionId } from './useSessionId'
import { HOLD_EXTEND_THROTTLE_MS } from '@/lib/holds/constants'

type HoldState = {
  holdId: string | null
  claiming: boolean
  holdExpired: boolean
}

export function useSlotHold() {
  const sessionId = useSessionId()
  const [state, setState] = useState<HoldState>({
    holdId: null,
    claiming: false,
    holdExpired: false,
  })
  const abortRef = useRef<AbortController | null>(null)
  const lastExtendRef = useRef(0)

  const extendHold = useCallback(() => {
    const now = Date.now()
    if (now - lastExtendRef.current < HOLD_EXTEND_THROTTLE_MS) return

    lastExtendRef.current = now

    fetch('/api/extend-hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.extended) {
          setState((prev) => ({ ...prev, holdId: null, holdExpired: true }))
        }
      })
      .catch(() => {})
  }, [sessionId])

  useEffect(() => {
    if (!state.holdId) return

    const handler = () => extendHold()
    const events = ['keydown', 'pointerdown', 'pointermove', 'scroll', 'touchstart'] as const

    for (const event of events) {
      document.addEventListener(event, handler, { passive: true })
    }

    return () => {
      for (const event of events) {
        document.removeEventListener(event, handler)
      }
    }
  }, [state.holdId, extendHold])

  const claimHold = useCallback(
    async (start: string, end: string): Promise<boolean> => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setState({ holdId: null, claiming: true, holdExpired: false })
      lastExtendRef.current = 0

      try {
        const res = await fetch('/api/hold-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, start, end }),
          signal: controller.signal,
        })

        const json = await res.json()

        if (json.success) {
          setState({ holdId: json.holdId, claiming: false, holdExpired: false })
          return true
        }

        setState({ holdId: null, claiming: false, holdExpired: false })
        return false
      } catch {
        if (!controller.signal.aborted) {
          setState({ holdId: null, claiming: false, holdExpired: false })
        }
        return false
      }
    },
    [sessionId]
  )

  const releaseHold = useCallback(() => {
    abortRef.current?.abort()
    setState({ holdId: null, claiming: false, holdExpired: false })
    lastExtendRef.current = 0

    fetch('/api/release-hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {})
  }, [sessionId])

  return {
    sessionId,
    holdId: state.holdId,
    claiming: state.claiming,
    holdExpired: state.holdExpired,
    claimHold,
    releaseHold,
  }
}
