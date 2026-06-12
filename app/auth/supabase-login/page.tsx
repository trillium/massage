/**
 * Supabase Login Page
 *
 * Standalone login page using magic links.
 * Redirects to requested page after successful login.
 *
 * URL: /auth/supabase-login
 * Query params:
 * - redirectTo: Where to go after login (default: /)
 */

import { LoginForm } from '@/components/auth/supabase/LoginForm'
import { Suspense } from 'react'
import { H1 } from '@/components/ui/heading'
import { TextSmMuted } from '@/components/ui/text'

function LoginContent({ redirectTo }: { redirectTo?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-surface-50 px-8 py-10 shadow-md">
          <div className="mb-8 text-center">
            <H1>Sign In</H1>
            <TextSmMuted className="mt-2">Enter your email to receive a magic link</TextSmMuted>
          </div>

          <LoginForm redirectTo={redirectTo} />
        </div>

        <TextSmMuted className="mt-6 text-center">
          New here?{' '}
          <a href="/" className="font-medium text-blue-600 hover:text-blue-500">
            Learn more
          </a>
        </TextSmMuted>
      </div>
    </div>
  )
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-blue-600"></div>
          </div>
        </div>
      }
    >
      <LoginContent redirectTo={redirectTo} />
    </Suspense>
  )
}
