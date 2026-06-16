'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import Spinner from '@/components/Spinner'
import { AdminAuthChip } from '@/components/auth/admin/AdminAuthChip'
import { identifyAuthenticatedUser } from '@/lib/posthog-utils'
import auth from '@/data/auth.json'
import { H1 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface AdminAuthProviderProps {
  children: React.ReactNode
}

interface AdminAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  adminEmail: string | null
  error: string | null
}

async function fetchAdminRole(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<{ error: string } | { role: string }> {
  const { data: profile, error: profileError } = await supabase
    .schema('public')
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  if (profileError || !profile) return { error: 'Unable to verify admin access.' }
  return { role: profile.role }
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isLoading: true,
    adminEmail: null,
    error: null,
  })

  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowserClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!supabase) {
      setAuthState({ isAuthenticated: false, isLoading: false, adminEmail: null, error: null })
      return
    }

    const checkAdminAccess = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            adminEmail: null,
            error: auth.adminAuth.loginRequired,
          })
          return
        }

        if (!user) {
          router.replace(`/auth/supabase-login?redirectTo=${encodeURIComponent(pathname)}`)
          return
        }

        const roleResult = await fetchAdminRole(supabase, user.id)

        if ('error' in roleResult) {
          console.error('[Admin Auth] Profile fetch error:', roleResult.error)
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            adminEmail: null,
            error: roleResult.error,
          })
          return
        }

        if (roleResult.role !== 'admin') {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            adminEmail: null,
            error: auth.adminAuth.privilegesRequired,
          })
          return
        }

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
          error: auth.adminAuth.error,
        })
      }
    }

    checkAdminAccess()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(checkAdminAccess, 300)
    })

    return () => {
      subscription.unsubscribe()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase?.auth.signOut()
    router.push('/auth/login')
  }

  if (authState.isLoading) {
    return (
      <Stack className="min-h-screen" direction="row" align="center" justify="center">
        <Box className="text-center">
          <Spinner />
          <TextBase className="mt-4 text-accent-600 dark:text-accent-400">
            {auth.adminAuth.verifying}
          </TextBase>
        </Box>
      </Stack>
    )
  }

  if (!authState.isAuthenticated) {
    return (
      <Stack direction="row" align="center" justify="center">
        <Box className="max-w-md rounded-lg bg-surface-50 p-8 text-center shadow-lg dark:bg-surface-800">
          <Box className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/20">
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
          </Box>
          <H1 className="mb-2">{auth.adminAuth.heading}</H1>
          <TextBase className="mb-4 text-accent-600 dark:text-accent-400">
            {authState.error}
          </TextBase>
          <Box className="text-sm text-accent-500 dark:text-accent-400">
            <TextBase>
              {auth.adminAuth.loginPromptPrefix}{' '}
              <Link
                href={`/auth/supabase-login?redirectTo=${encodeURIComponent(pathname)}`}
                className="text-blue-600 hover:underline"
              >
                {auth.adminAuth.loginLink}
              </Link>{' '}
              {auth.adminAuth.loginPromptSuffix}
            </TextBase>
          </Box>
        </Box>
      </Stack>
    )
  }

  return (
    <Box className="min-h-screen">
      <AdminAuthChip adminEmail={authState.adminEmail} onLogout={handleLogout} />
      {children}
    </Box>
  )
}
