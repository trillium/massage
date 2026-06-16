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
import { H1, H2, H3 } from '@/components/ui/heading'
import { TextSm, TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

function AuthTestContent() {
  const { user, profile, session, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <Stack className="min-h-screen" direction="row" align="center" justify="center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-blue-600"></div>
          <TextBase className="mt-2 text-accent-600">Loading auth state...</TextBase>
        </div>
      </Stack>
    )
  }

  return (
    <div className="min-h-screen bg-surface-100 p-8">
      <div className="mx-auto max-w-4xl">
        <Stack className="mb-6" direction="row" align="center" justify="between">
          <H1>Supabase Auth Test</H1>
          <UserMenu />
        </Stack>

        <div className="grid gap-6 md:grid-cols-2">
          {!user && (
            <div className="rounded-lg bg-surface-50 p-6 shadow">
              <H2 className="mb-4">Login</H2>
              <LoginForm />
            </div>
          )}

          <div className="rounded-lg bg-surface-50 p-6 shadow">
            <H2 className="mb-4">Auth State</H2>
            <div className="space-y-3">
              <Box>
                <span className="font-medium">Status: </span>
                <TextSm className="rounded px-2 py-1 ${ user ? 'bg-green-100 text-green-800' : 'bg-surface-200 text-accent-800' }">
                  {user ? 'Authenticated' : 'Not authenticated'}
                </TextSm>
              </Box>

              {user && (
                <>
                  <Box>
                    <span className="font-medium">Email: </span>
                    <span className="text-accent-700">{user.email}</span>
                  </Box>
                  <Box>
                    <span className="font-medium">Role: </span>
                    <span className="text-accent-700">{profile?.role || 'Loading...'}</span>
                  </Box>
                  <Box>
                    <span className="font-medium">Is Admin: </span>
                    <span className="text-accent-700">{isAdmin ? 'Yes' : 'No'}</span>
                  </Box>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-surface-50 p-6 shadow">
            <H2 className="mb-4">User Object</H2>
            <pre className="overflow-auto rounded bg-surface-100 p-3 text-xs">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg bg-surface-50 p-6 shadow">
            <H2 className="mb-4">Profile Object</H2>
            <pre className="overflow-auto rounded bg-surface-100 p-3 text-xs">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>

          <div className="md:col-span-2 rounded-lg bg-surface-50 p-6 shadow">
            <H2 className="mb-4">Session Object</H2>
            <pre className="overflow-auto rounded bg-surface-100 p-3 text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>

        {user && (
          <div className="mt-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
            <H2 className="mb-4" status="info">
              Protected Content Example
            </H2>
            <TextBase className="mb-4 text-blue-800">
              This content is only visible because you are authenticated.
            </TextBase>

            {isAdmin && (
              <div className="mt-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
                <H3>Admin-Only Content</H3>
                <TextBase className="text-purple-800">
                  This content is only visible because you are an admin.
                </TextBase>
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
