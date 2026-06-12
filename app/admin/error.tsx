'use client'

import Link from '@/components/Link'
import systemData from '@/data/system.json'

const errorText = systemData.adminError

const isCredentialError = (message: string) =>
  message.toLowerCase().includes('google credentials') || message.includes('google_credentials')

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const credentialError = isCredentialError(error.message)

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-accent-900 dark:text-accent-100">
        {errorText.title}
      </h1>
      <p className="mt-4 text-lg text-accent-700 dark:text-accent-300">{errorText.message}</p>
      <p className="mt-2 text-sm text-accent-500 dark:text-accent-400">{error.message}</p>
      {credentialError && (
        <p className="mt-4 text-sm text-accent-600 dark:text-accent-400">
          {errorText.credentialErrorMessage}{' '}
          <Link href="/admin/connect-google" className="underline">
            {errorText.credentialErrorLink}
          </Link>{' '}
          {errorText.credentialErrorSuffix}
        </p>
      )}
      <div className="mt-8 flex gap-4">
        {credentialError ? (
          <Link
            href="/admin/connect-google"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
          >
            {errorText.connectGoogleButton}
          </Link>
        ) : (
          <button
            onClick={reset}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
          >
            {errorText.tryAgainButton}
          </button>
        )}
        <Link
          href="/admin"
          className="rounded-lg border border-accent-300 px-4 py-2 text-sm font-medium text-accent-700 transition-colors hover:bg-surface-200 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-800"
        >
          {errorText.adminDashboardButton}
        </Link>
      </div>
    </div>
  )
}
