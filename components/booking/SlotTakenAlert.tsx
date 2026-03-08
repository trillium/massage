'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function SlotTakenAlert() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const dismissed = useRef(false)

  useEffect(() => {
    if (dismissed.current) return
    if (searchParams.get('slotTaken') !== '1') return

    setVisible(true)
    router.refresh()

    const params = new URLSearchParams(searchParams.toString())
    params.delete('slotTaken')
    const clean = params.toString()
    window.history.replaceState(null, '', clean ? `${pathname}?${clean}` : pathname)
  }, [searchParams, router, pathname])

  if (!visible) return null

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-800 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-200">
      <p className="font-medium">That time slot was just booked by someone else.</p>
      <p className="mt-1 text-sm">
        Please pick a different time below — availability has been refreshed.
      </p>
      <button
        type="button"
        onClick={() => {
          dismissed.current = true
          setVisible(false)
        }}
        className="mt-2 text-sm font-medium text-amber-600 underline hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-100"
      >
        Dismiss
      </button>
    </div>
  )
}
