'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import Spinner from '@/components/Spinner'
import { AdminDebugInfo } from '@/components/auth/admin/AdminDebugInfo'
import { AdminAuthChip } from '@/components/auth/admin/AdminAuthChip'
import { identifyAuthenticatedUser } from '@/lib/posthog-utils'

interface AdminAuthProviderProps {
  children: React.ReactNode
}

interface AdminAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  adminEmail: string | null
  error: string | null
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isLoading: true,
    adminEmail: null,
    error: null,
  })

  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.log('[Admin Auth] No authenticated user:', userError?.message)
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            adminEmail: null,
            error: 'Please log in to access admin panel.',
          })
          return
        }

        console.log('[Admin Auth] User authenticated:', user.email)

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          console.error('[Admin Auth] Profile fetch error:', profileError?.message)
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            adminEmail: null,
            error: 'Unable to verify admin access.',
          })
          return
        }

        if (profile.role !== 'admin') {
          console.log('[Admin Auth] User is not admin:', profile.role)
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            adminEmail: null,
            error: 'Admin access required. Your account does not have admin privileges.',
          })
          return
        }

        console.log('[Admin Auth] Admin access granted:', user.email)
        await identifyAuthenticatedUser(user.email!, 'admin_session')

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          adminEmail: user.email!,
          error: null,
        })
      } catch (error) {
        console.error('[Admin Auth] Unexpected error:', error)
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          adminEmail: null,
          error: 'An error occurred while checking admin access.',
        })
      }
    }

    checkAdminAccess()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (authState.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-center">
          <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
            <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <svg
                className="mx-auto h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Admin Access Required
            </h1>
            <p className="mb-4 text-gray-600 dark:text-gray-400">{authState.error}</p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>
                Please{' '}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  log in
                </Link>{' '}
                with an admin account.
              </p>
            </div>
          </div>
        </div>
        <AdminDebugInfo />
      </>
    )
  }

  // Authenticated - provide admin context to children
  return (
    <div className="min-h-screen">
      <AdminAuthChip adminEmail={authState.adminEmail} onLogout={handleLogout} />
      {children}
    </div>
  )
}
