'use client'

import { useState } from 'react'

export function DeclineButton({ declineUrl }: { declineUrl: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'declined' | 'error'>('idle')

  const handleDecline = async () => {
    setState('loading')
    try {
      const url = new URL(declineUrl)
      const response = await fetch(url.pathname + url.search)
      if (response.ok) {
        setState('declined')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  if (state === 'declined') {
    return <span className="text-sm font-medium text-gray-500">Declined</span>
  }

  return (
    <div>
      <button
        onClick={handleDecline}
        disabled={state === 'loading'}
        className={
          state === 'loading'
            ? 'cursor-not-allowed rounded bg-gray-400 px-4 py-2 text-sm font-medium text-white'
            : 'rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700'
        }
      >
        {state === 'loading' ? 'Declining...' : 'Decline'}
      </button>
      {state === 'error' && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">Failed to decline</p>
      )}
    </div>
  )
}
