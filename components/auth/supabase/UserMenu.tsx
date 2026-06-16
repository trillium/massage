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
import auth from '@/data/auth.json'
import { TextSmMedium, TextXsMedium } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

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
    return <Box className="h-8 w-8 animate-pulse rounded-full bg-surface-200"></Box>
  }

  if (!user) {
    return null
  }

  return (
    <Box className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg border border-accent-200 bg-surface-50 px-3 py-2 text-sm hover:bg-surface-100"
      >
        <Stack
          className="h-8 w-8 rounded-full bg-blue-600 text-white"
          direction="row"
          align="center"
          justify="center"
        >
          {user.email?.[0]?.toUpperCase() || 'U'}
        </Stack>
        <Box className="text-left">
          <Box className="font-medium">{user.email}</Box>
          {isAdmin && <Box className="text-xs text-blue-600">{auth.userMenu.admin}</Box>}
        </Box>
      </Button>

      {isOpen && (
        <>
          <Box className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <Box className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-accent-200 bg-surface-50 shadow-lg">
            <Box className="border-b border-accent-100 p-4">
              <TextSmMedium>{user.email}</TextSmMedium>
              {isAdmin && (
                <TextXsMedium
                  className="mt-1 inline-block rounded bg-blue-100 px-2 py-1"
                  status="info"
                >
                  {auth.userMenu.administrator}
                </TextXsMedium>
              )}
            </Box>

            <Box className="p-2">
              <Box className="px-3 py-2 text-sm text-accent-700">
                <Box>
                  <span className="font-medium">{auth.userMenu.userIdLabel}</span>
                  <Box className="mt-1 font-mono text-xs text-accent-500">
                    {user.id.slice(0, 8)}
                    {auth.userMenu.userIdEllipsis}
                  </Box>
                </Box>
                {profile?.created_at && (
                  <Box className="mt-2">
                    <span className="font-medium">{auth.userMenu.memberSinceLabel}</span>
                    <Box className="text-xs text-accent-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            <Box className="border-t border-accent-100 p-2">
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:text-accent-400"
              >
                {isSigningOut ? auth.userMenu.signingOut : auth.userMenu.signOut}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}
