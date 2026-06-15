'use client'

import Link from '@/components/Link'
import systemData from '@/data/system.json'
import { H1Hero } from '@/components/ui/heading'
import { TextLg } from '@/components/ui/text'

import { Button } from '@/components/ui/button'

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { bookingError } = systemData
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <H1Hero>{bookingError.title}</H1Hero>
      <TextLg className="mt-4">{bookingError.description}</TextLg>
      <div className="mt-8 flex gap-4">
        <Button
          onClick={reset}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
        >
          {bookingError.buttons.retry}
        </Button>
        <Link
          href="/"
          className="rounded-lg border border-accent-300 px-4 py-2 text-sm font-medium text-accent-700 transition-colors hover:bg-surface-200 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-800"
        >
          {bookingError.buttons.home}
        </Link>
      </div>
    </div>
  )
}
