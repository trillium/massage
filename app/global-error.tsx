'use client'

import system from '@/data/system.json'

import { Button } from '@/components/ui/button'
import { H1 } from '@/components/ui/heading'

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <H1>{system.globalError.message}</H1>
          <p>{system.globalError.description}</p>
          <Button
            type="button"
            onClick={reset}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            {system.globalError.buttons.retry}
          </Button>
        </div>
      </body>
    </html>
  )
}
