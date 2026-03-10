'use client'

import { useCallback, useRef, useState } from 'react'
import { useSessionId } from './useSessionId'

type HoldState = {
  holdId: string | null
  claiming: boolean
}

export function useSlotHold() {
  const sessionId = useSessionId()
  const [state, setState] = useState<HoldState>({ holdId: null, claiming: false })
  const abortRef = useRef<AbortController | null>(null)

  const claimHold = useCallback(
    async (start: string, end: string): Promise<boolean> => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setState({ holdId: null, claiming: true })

      try {
        const res = await fetch('/api/hold-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, start, end }),
          signal: controller.signal,
        })

        const json = await res.json()

        if (json.success) {
          setState({ holdId: json.holdId, claiming: false })
          return true
        }

        setState({ holdId: null, claiming: false })
        return false
      } catch {
        if (!controller.signal.aborted) {
          setState({ holdId: null, claiming: false })
        }
        return false
      }
    },
    [sessionId]
  )

  const releaseHold = useCallback(() => {
    abortRef.current?.abort()
    setState({ holdId: null, claiming: false })

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
    claimHold,
    releaseHold,
  }
}
