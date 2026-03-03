'use client'

import Link from '@/components/Link'

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
        Booking Unavailable
      </h1>
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
        We couldn't load the booking page. Please try again in a moment.
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
