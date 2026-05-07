'use client'

interface ConnectGoogleClientProps {
  connectedEmail: string | null
  successEmail: string | null
  error: string | null
}

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'You denied access. Please try again.',
  callback_failed: 'Something went wrong during the connection. Please try again.',
  missing_code: 'OAuth response was incomplete. Please try again.',
}

export default function ConnectGoogleClient({
  connectedEmail,
  successEmail,
  error,
}: ConnectGoogleClientProps) {
  const displayEmail = successEmail ?? connectedEmail
  const isConnected = !!displayEmail
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? 'An unexpected error occurred.') : null

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {successEmail && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          Successfully connected <strong>{successEmail}</strong>
        </div>
      )}

      <div className="rounded-lg border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">
          Connected Account
        </h2>
        {isConnected ? (
          <p className="text-accent-900 dark:text-accent-100">{displayEmail}</p>
        ) : (
          <p className="text-surface-500 dark:text-surface-400">No account connected</p>
        )}
      </div>

      <div className="rounded-lg border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">
          Permissions Requested
        </h2>
        <ul className="mb-4 mt-2 list-inside list-disc space-y-1 text-sm text-surface-700 dark:text-surface-300">
          <li>Read and write Google Calendar events</li>
          <li>Send email via Gmail on your behalf</li>
        </ul>
        <a
          href="/api/auth/google"
          className="inline-block rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
        >
          {isConnected ? 'Reconnect Google Account' : 'Connect Google Account'}
        </a>
      </div>
    </div>
  )
}
