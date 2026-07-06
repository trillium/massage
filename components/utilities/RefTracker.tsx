'use client'

import { useEffect, useRef } from 'react'
import { usePostHog } from 'posthog-js/react'

export function decodeRef(ref: string): string | null {
  try {
    const decoded = atob(ref.replace(/-/g, '+').replace(/_/g, '/'))
    return /^[\x20-\x7E]{2,64}$/.test(decoded) ? decoded : null
  } catch {
    return null
  }
}

export default function RefTracker() {
  const posthog = usePostHog()
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current || !posthog) return
    didRun.current = true

    const ref = new URLSearchParams(window.location.search).get('ref')
    if (!ref) return

    const decoded = decodeRef(ref)
    posthog.capture('ref_link_visit', {
      ref,
      ref_decoded: decoded ?? undefined,
      $set: { latest_ref: decoded ?? ref },
      $set_once: { initial_ref: decoded ?? ref },
    })
  }, [posthog])

  return null
}
