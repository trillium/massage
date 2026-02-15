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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading auth state...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Supabase Auth Test</h1>
          <UserMenu />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {!user && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Login</h2>
              <LoginForm />
            </div>
          )}

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Auth State</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Status: </span>
                <span
                  className={`rounded px-2 py-1 text-sm ${
                    user
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user ? 'Authenticated' : 'Not authenticated'}
                </span>
              </div>

              {user && (
                <>
                  <div>
                    <span className="font-medium">Email: </span>
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                  <div>
                    <span className="font-medium">Role: </span>
                    <span className="text-gray-700">
                      {profile?.role || 'Loading...'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Is Admin: </span>
                    <span className="text-gray-700">
                      {isAdmin ? 'Yes' : 'No'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">User Object</h2>
            <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Profile Object</h2>
            <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>

          <div className="md:col-span-2 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Session Object</h2>
            <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>

        {user && (
          <div className="mt-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-blue-900">
              Protected Content Example
            </h2>
            <p className="mb-4 text-blue-800">
              This content is only visible because you are authenticated.
            </p>

            {isAdmin && (
              <div className="mt-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
                <h3 className="font-semibold text-purple-900">
                  Admin-Only Content
                </h3>
                <p className="text-purple-800">
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
