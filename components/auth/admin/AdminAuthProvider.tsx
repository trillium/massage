'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AdminAuthManager } from '@/lib/adminAuth'
import Spinner from '@/components/Spinner'
import { AdminDebugInfo } from '@/components/auth/admin/AdminDebugInfo'
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

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const authenticateAdmin = async () => {
      // Check for URL parameters first (new login)
      const urlEmail = searchParams.get('email')
      const urlHash = searchParams.get('hash')

      if (urlEmail && urlHash) {
        // Attempting new login with URL parameters - validate server-side
        try {
          console.log('Making admin validation request:', {
            email: urlEmail,
            hash: urlHash.substring(0, 16) + '...',
          })

          const response = await fetch('/api/admin/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: urlEmail, hash: urlHash }),
          })

          console.log('Validation response status:', response.status)

          const result = await response.json()
          console.log('Validation response:', result)

          if (result.valid) {
            // Valid credentials, create session (skip client-side validation since server already validated)
            console.log('Creating session for:', urlEmail)
            if (AdminAuthManager.createValidatedSession(urlEmail, urlHash)) {
              // Clean URL by removing auth parameters
              const cleanUrl = new URL(window.location.href)
              cleanUrl.searchParams.delete('email')
              cleanUrl.searchParams.delete('hash')
              router.replace(cleanUrl.pathname)

              // Add PostHog identification for admin
              await identifyAuthenticatedUser(urlEmail, 'admin_login')
              setAuthState({
                isAuthenticated: true,
                isLoading: false,
                adminEmail: urlEmail,
                error: null,
              })
              return
            } else {
              console.error('Failed to create session')
            }
          } else {
            console.log('Server validation failed')
          }
        } catch (error) {
          console.error('Admin validation error:', error)
        }

        // Invalid URL credentials or validation failed
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          adminEmail: null,
          error: 'Invalid admin credentials. Please check your admin link.',
        })
        return
      }

      // No URL parameters, check existing session
      const session = AdminAuthManager.validateSession()
      if (session) {
        // Add PostHog identification for returning admin
        await identifyAuthenticatedUser(session.email, 'admin_session')
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          adminEmail: session.email,
          error: null,
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          adminEmail: null,
          error: 'Admin access required. Please use your secure admin link.',
        })
      }
    }

    authenticateAdmin()
  }, [searchParams, router])

  const handleLogout = () => {
    AdminAuthManager.clearSession()
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      adminEmail: null,
      error: 'Logged out successfully.',
    })
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
              <p className="mb-2">To access the admin panel:</p>
              <ul className="list-inside list-decimal space-y-1 text-left">
                <li>Request an admin link via email</li>
              </ul>
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
      <div className="border-b bg-blue-50 px-4 py-2 text-sm dark:bg-blue-900/20">
        <div className="flex items-center justify-between">
          <span className="text-blue-800 dark:text-blue-200">
            ✓ Admin authenticated: {authState.adminEmail}
          </span>
          <button
            onClick={handleLogout}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
          >
            Logout
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}
