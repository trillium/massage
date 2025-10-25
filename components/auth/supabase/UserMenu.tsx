/**
 * User Menu Component
 *
 * Displays user info and sign-out button.
 * Shows loading state while auth is initializing.
 * Optionally shows admin badge.
 *
 * Usage:
 * <UserMenu />
 */

'use client'

import { useAuth } from './SupabaseAuthProvider'
import { useState } from 'react'

export function UserMenu() {
  const { user, profile, isAdmin, loading, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    setIsSigningOut(false)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="text-left">
          <div className="font-medium">{user.email}</div>
          {isAdmin && (
            <div className="text-xs text-blue-600">Admin</div>
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-100 p-4">
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              {isAdmin && (
                <span className="mt-1 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  Administrator
                </span>
              )}
            </div>

            <div className="p-2">
              <div className="px-3 py-2 text-sm text-gray-700">
                <div>
                  <span className="font-medium">User ID:</span>
                  <div className="mt-1 font-mono text-xs text-gray-500">
                    {user.id.slice(0, 8)}...
                  </div>
                </div>
                {profile?.created_at && (
                  <div className="mt-2">
                    <span className="font-medium">Member since:</span>
                    <div className="text-xs text-gray-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 p-2">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:text-gray-400"
              >
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
