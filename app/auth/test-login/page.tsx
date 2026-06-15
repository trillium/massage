/**
 * Test Login Page - FOR E2E TESTING ONLY
 *
 * This page allows password-based login for E2E tests.
 * Should NEVER be deployed to production.
 *
 * SECURITY: This route is excluded from production builds via next.config.js
 * The webpack ignore-loader removes this file entirely from production builds.
 */

'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { notFound } from 'next/navigation'
import { H1 } from '@/components/ui/heading'
import { TextSmMuted } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/stack'

export const dynamic = 'force-dynamic'

export default function TestLoginPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('[TestLogin] Starting authentication...')
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('[TestLogin] Auth response:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      error: signInError?.message,
    })

    if (signInError) {
      console.error('[TestLogin] Auth error:', signInError)
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      console.log('[TestLogin] Session established, redirecting to /')

      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log('[TestLogin] Calling router.push("/")')
      router.push('/')
    } else {
      console.error('[TestLogin] No session in response')
      setError('No session returned from authentication')
      setLoading(false)
    }
  }

  return (
    <Stack className="min-h-screen" direction="row" align="center" justify="center">
      <div className="w-full max-w-md p-8">
        <H1 className="mb-4">Test Login</H1>
        <TextSmMuted className="mb-4">For E2E testing only</TextSmMuted>

        {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded border p-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded border p-2"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-surface-400"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </Stack>
  )
}
