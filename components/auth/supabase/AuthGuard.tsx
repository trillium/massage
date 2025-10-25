/**
 * Auth Guard Component
 *
 * Protects components by requiring authentication.
 * Shows loading state while checking auth.
 * Optionally redirects to login page.
 *
 * Usage:
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 *
 * Or with admin requirement:
 * <AuthGuard requireAdmin>
 *   <AdminContent />
 * </AuthGuard>
 */

'use client'

import { useAuth } from './SupabaseAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({
  children,
  requireAdmin = false,
  redirectTo = '/login',
  fallback,
}: AuthGuardProps) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push(redirectTo)
    } else if (requireAdmin && !isAdmin) {
      router.push('/')
    }
  }, [user, isAdmin, loading, requireAdmin, redirectTo, router])

  if (loading) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )
    )
  }

  if (!user) {
    return null
  }

  if (requireAdmin && !isAdmin) {
    return null
  }

  return <>{children}</>
}
