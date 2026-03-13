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

function LoginContent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-surface-50 px-8 py-10 shadow-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-accent-900">Sign In</h1>
            <p className="mt-2 text-sm text-accent-600">Enter your email to receive a magic link</p>
          </div>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-accent-600">
          New here?{' '}
          <a href="/" className="font-medium text-blue-600 hover:text-blue-500">
            Learn more
          </a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  )
}
