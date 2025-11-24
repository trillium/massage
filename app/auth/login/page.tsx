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

function LoginContent({
  searchParams,
}: {
  searchParams: { error?: string; error_description?: string }
}) {
  const error = searchParams.error
  const errorDescription = searchParams.error_description

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white px-8 py-10 shadow-md dark:bg-gray-800">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter your email to receive a magic link
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Authentication Error
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {errorDescription || error}
              </p>
              {error === 'server_error' && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-500">
                  This may be a database configuration issue. Check the server logs for details.
                </p>
              )}
            </div>
          )}

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          New to Trillium Massage?{' '}
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Learn more
          </Link>
        </p>
      </div>
    </div>
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
          </div>
        </div>
      }
    >
      <LoginContent searchParams={params} />
    </Suspense>
  )
}
