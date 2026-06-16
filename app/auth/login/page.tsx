/**
 * Login Page
 *
 * Standalone login page using magic links and OAuth.
 * Redirects to requested page after successful login.
 *
 * URL: /auth/login
 * Query params:
 * - redirectTo: Where to go after login (default: /)
 * - error: Error code from callback
 * - error_description: Detailed error message
 */

import { LoginForm } from '@/components/auth/supabase/LoginForm'
import Link from 'next/link'
import { Suspense } from 'react'
import { H1, H3 } from '@/components/ui/heading'
import { TextSm, TextSmMuted, TextXs } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

function LoginContent({
  searchParams,
}: {
  searchParams: { error?: string; error_description?: string }
}) {
  const error = searchParams.error
  const errorDescription = searchParams.error_description

  return (
    <Stack
      className="min-h-screen bg-surface-100 px-4 dark:bg-surface-900"
      direction="row"
      align="center"
      justify="center"
    >
      <Box className="w-full max-w-md">
        <Box className="rounded-lg bg-surface-50 px-8 py-10 shadow-md dark:bg-surface-800">
          <Box className="mb-8 text-center">
            <H1 className="dark:text-white">Sign In</H1>
            <TextSmMuted className="mt-2">Sign in to manage your account</TextSmMuted>
          </Box>

          {error && (
            <Box className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <H3 status="error">Authentication Error</H3>
              <TextSm className="mt-1" status="error">
                {errorDescription || error}
              </TextSm>
              {error === 'server_error' && (
                <TextXs className="mt-2" status="error">
                  This may be a database configuration issue. Check the server logs for details.
                </TextXs>
              )}
            </Box>
          )}

          <LoginForm />
        </Box>

        <TextSmMuted className="mt-6 text-center">
          New here?{' '}
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Learn more
          </Link>
        </TextSmMuted>
      </Box>
    </Stack>
  )
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams

  return (
    <Suspense
      fallback={
        <Stack
          className="min-h-screen bg-surface-100 dark:bg-surface-900"
          direction="row"
          align="center"
          justify="center"
        >
          <Box className="text-center">
            <Box className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-blue-600 dark:border-accent-700 dark:border-t-blue-400"></Box>
          </Box>
        </Stack>
      }
    >
      <LoginContent searchParams={params} />
    </Suspense>
  )
}
