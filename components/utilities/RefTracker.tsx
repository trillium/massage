'use client'

import { useEffect, useRef } from 'react'
import { usePostHog } from 'posthog-js/react'

export default function RefTracker() {
  const posthog = usePostHog()
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current || !posthog) return
    didRun.current = true

    const ref = new URLSearchParams(window.location.search).get('ref')
    if (!ref) return

    posthog.capture('ref_link_visit', {
      ref,
      $set: { latest_ref: ref },
      $set_once: { initial_ref: ref },
    })
  }, [posthog])

  return null
}
