'use client'

import { useState } from 'react'
import { TextSmMedium, TextXs } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Box } from '@/components/ui/box'

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
    return <TextSmMedium status="muted">Declined</TextSmMedium>
  }

  return (
    <Box>
      <Button
        onClick={handleDecline}
        disabled={state === 'loading'}
        className={
          state === 'loading'
            ? 'cursor-not-allowed rounded bg-surface-400 px-4 py-2 text-sm font-medium text-white'
            : 'rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700'
        }
      >
        {state === 'loading' ? 'Declining...' : 'Decline'}
      </Button>
      {state === 'error' && (
        <TextXs className="mt-1" status="error">
          Failed to decline
        </TextXs>
      )}
    </Box>
  )
}
