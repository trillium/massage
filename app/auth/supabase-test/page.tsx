/**
 * Supabase Auth Test Page
 *
 * Demonstrates all auth components working together.
 * Shows current auth state and available actions.
 *
 * URL: /auth/supabase-test
 */

'use client'

import { SupabaseAuthProvider, useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'
import { LoginForm } from '@/components/auth/supabase/LoginForm'
import { UserMenu } from '@/components/auth/supabase/UserMenu'
import { AuthGuard } from '@/components/auth/supabase/AuthGuard'

function AuthTestContent() {
  const { user, profile, session, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading auth state...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Supabase Auth Test
          </h1>
          <UserMenu />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {!user && (
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Login</h2>
              <LoginForm />
            </div>
          )}

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Auth State
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Status: </span>
                <span
                  className={`rounded px-2 py-1 text-sm ${
                    user
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {user ? 'Authenticated' : 'Not authenticated'}
                </span>
              </div>

              {user && (
                <>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Email: </span>
                    <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Role: </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {profile?.role || 'Loading...'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Is Admin: </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {isAdmin ? 'Yes' : 'No'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              User Object
            </h2>
            <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900 dark:bg-gray-700 dark:text-gray-100">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Profile Object
            </h2>
            <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900 dark:bg-gray-700 dark:text-gray-100">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg bg-white p-6 shadow md:col-span-2 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Session Object
            </h2>
            <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900 dark:bg-gray-700 dark:text-gray-100">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>

        {user && (
          <div className="mt-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
            <h2 className="mb-4 text-xl font-semibold text-blue-900 dark:text-blue-200">
              Protected Content Example
            </h2>
            <p className="mb-4 text-blue-800 dark:text-blue-300">
              This content is only visible because you are authenticated.
            </p>

            {isAdmin && (
              <div className="mt-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                <h3 className="font-semibold text-purple-900 dark:text-purple-200">
                  Admin-Only Content
                </h3>
                <p className="text-purple-800 dark:text-purple-300">
                  This content is only visible because you are an admin.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthTestPage() {
  return (
    <SupabaseAuthProvider>
      <AuthTestContent />
    </SupabaseAuthProvider>
  )
}
