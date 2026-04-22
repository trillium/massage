'use client'

import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'

export default function SlugAnalytics({ slug }: { slug: string }) {
  const posthog = usePostHog()
  useEffect(() => {
    if (!posthog || !slug) return
    posthog.capture('booking_page_viewed', {
      booking_slug: slug,
      $set_once: { [`visited_${slug}`]: true, first_booking_slug: slug },
    })
  }, [posthog, slug])
  return null
}
