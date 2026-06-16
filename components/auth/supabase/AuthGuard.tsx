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
import authData from '@/data/auth.json'
import { TextSmMuted } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

const guardText = authData.authGuard

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
        <Stack className="min-h-screen" direction="row" align="center" justify="center">
          <Box className="text-center">
            <Box className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-blue-600"></Box>
            <TextSmMuted className="mt-2">{guardText.loading}</TextSmMuted>
          </Box>
        </Stack>
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
