'use client'

import { useEffect, useRef } from 'react'
import { usePostHog } from 'posthog-js/react'
import { tryDecodeRef } from '@/lib/ref/refCodec'

export default function RefTracker() {
  const posthog = usePostHog()
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current || !posthog) return
    didRun.current = true

    const param = process.env.NEXT_PUBLIC_REF_PARAM || 'ref'
    const ref = new URLSearchParams(window.location.search).get(param)
    if (!ref) return

    const secret = process.env.NEXT_PUBLIC_REF_CODE_SECRET
    const decoded = secret ? tryDecodeRef(ref, secret) : null

    posthog.capture('ref_link_visit', {
      ref,
      ref_decoded: decoded ?? undefined,
      $set: { latest_ref: decoded ?? ref },
      $set_once: { initial_ref: decoded ?? ref },
    })

    // Hand off to the server so it tags referred_by/ref_token on the same
    // person using the write key. Same-origin so the ph_* cookie rides along.
    fetch(`/api/ref?${param}=${encodeURIComponent(ref)}`, {
      credentials: 'same-origin',
      keepalive: true,
    }).catch(() => {})
  }, [posthog])

  return null
}
