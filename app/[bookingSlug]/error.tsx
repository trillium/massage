'use client'

import Link from '@/components/Link'
import systemData from '@/data/system.json'

import { Button } from '@/components/ui/button'
import { H1 } from '@/components/ui/heading'

import { TextLg } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'

export default function BookingSlugError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { bookingSlugError } = systemData
  console.error('[BookingSlugError]', error?.message, error?.stack)
  return (
    <Stack className="px-4 py-24 text-center" direction="col" align="center" justify="center">
      {/* ds-ignore */}
      <H1 className="text-4xl font-extrabold tracking-tight">{bookingSlugError.title}</H1>
      <TextLg status="subtle" className="mt-4">
        {bookingSlugError.description}
      </TextLg>
      <Stack className="mt-8" direction="row" gap={4}>
        <Button
          onClick={reset}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
        >
          {bookingSlugError.buttons.retry}
        </Button>
        <Link
          href="/book"
          className="rounded-lg border border-accent-300 px-4 py-2 text-sm font-medium text-accent-700 transition-colors hover:bg-surface-200 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-800"
        >
          {bookingSlugError.buttons.home}
        </Link>
      </Stack>
    </Stack>
  )
}
