'use client'

import { useMemo } from 'react'

export function useSessionId(): string {
  return useMemo(() => {
    const key = 'booking_session_id'
    let id = sessionStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(key, id)
    }
    return id
  }, [])
}
