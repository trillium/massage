'use client'

import { useState } from 'react'

export function useSessionId(): string {
  const [id] = useState(() => {
    if (typeof sessionStorage === 'undefined') return ''
    const key = 'booking_session_id'
    let stored = sessionStorage.getItem(key)
    if (!stored) {
      stored = crypto.randomUUID()
      sessionStorage.setItem(key, stored)
    }
    return stored
  })
  return id
}
