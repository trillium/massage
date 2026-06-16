'use client'

import Link from '@/components/Link'
import system from '@/data/system.json'
import { H1 } from '@/components/ui/heading'

import { Button } from '@/components/ui/button'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Stack className="px-4 py-24 text-center" direction="col" align="center" justify="center">
      {/* ds-ignore */}
      <H1 className="text-6xl">{system.globalError.title}</H1>
      <TextBase status="subtle" className="mt-4 text-xl font-bold">
        {' '}
        {/* ds-ignore */}
        {system.globalError.message}
      </TextBase>
      <TextBase status="muted" className="mt-2">
        {system.globalError.description}
      </TextBase>
      <Stack className="mt-8" direction="row" gap={4}>
        <Button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
        >
          {system.globalError.buttons.retry}
        </Button>
        <Link
          href="/"
          className="rounded-lg border border-accent-300 px-4 py-2 text-sm font-medium text-accent-700 transition-colors hover:bg-surface-200 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-800"
        >
          {system.globalError.buttons.home}
        </Link>
      </Stack>
    </Stack>
  )
}
