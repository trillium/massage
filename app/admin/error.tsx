'use client'

import Link from '@/components/Link'
import systemData from '@/data/system.json'
import { H1Hero } from '@/components/ui/heading'
import { TextLg, TextSmMuted } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'

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
    <Stack className="px-4 py-24 text-center" direction="col" align="center" justify="center">
      <H1Hero>{errorText.title}</H1Hero>
      <TextLg className="mt-4">{errorText.message}</TextLg>
      <TextSmMuted className="mt-2">{error.message}</TextSmMuted>
      {credentialError && (
        <TextSmMuted className="mt-4">
          {errorText.credentialErrorMessage}{' '}
          <Link href="/admin/connect-google" className="underline">
            {errorText.credentialErrorLink}
          </Link>{' '}
          {errorText.credentialErrorSuffix}
        </TextSmMuted>
      )}
      <Stack className="mt-8" direction="row" gap={4}>
        {credentialError ? (
          <Link
            href="/admin/connect-google"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
          >
            {errorText.connectGoogleButton}
          </Link>
        ) : (
          <Button
            onClick={reset}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
          >
            {errorText.tryAgainButton}
          </Button>
        )}
        <Link
          href="/admin"
          className="rounded-lg border border-accent-300 px-4 py-2 text-sm font-medium text-accent-700 transition-colors hover:bg-surface-200 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-800"
        >
          {errorText.adminDashboardButton}
        </Link>
      </Stack>
    </Stack>
  )
}
