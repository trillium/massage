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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white px-8 py-10 shadow-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
            <p className="mt-2 text-sm text-gray-600">Enter your email to receive a magic link</p>
          </div>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to Trillium Massage?{' '}
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
