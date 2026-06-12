'use client'

import Link from '@/components/Link'
import system from '@/data/system.json'
import { H1 } from '@/components/ui/heading'

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <H1 className="text-6xl">{system.globalError.title}</H1>
      <p className="mt-4 text-xl font-bold text-accent-700 dark:text-accent-300">
        {system.globalError.message}
      </p>
      <p className="mt-2 text-accent-500 dark:text-accent-400">{system.globalError.description}</p>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
        >
          {system.globalError.buttons.retry}
        </button>
        <Link
          href="/"
          className="rounded-lg border border-accent-300 px-4 py-2 text-sm font-medium text-accent-700 transition-colors hover:bg-surface-200 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-800"
        >
          {system.globalError.buttons.home}
        </Link>
      </div>
    </div>
  )
}
