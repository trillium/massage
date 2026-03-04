'use client'

import * as Sentry from '@sentry/nextjs'
import Link from '@/components/Link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
        Oops
      </h1>
      <p className="mt-4 text-xl font-bold text-gray-700 dark:text-gray-300">
        Something went wrong.
      </p>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        We hit an unexpected error. You can try again or head back to the homepage.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  )
}
