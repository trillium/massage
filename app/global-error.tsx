'use client'

import system from '@/data/system.json'

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
          <h1>{system.globalError.message}</h1>
          <p>{system.globalError.description}</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            {system.globalError.buttons.retry}
          </button>
        </div>
      </body>
    </html>
  )
}
