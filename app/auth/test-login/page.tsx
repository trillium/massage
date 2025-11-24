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
import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'

export default function TestLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      notFound()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('[TestLogin] Starting authentication...')
    const supabase = getSupabaseBrowserClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('[TestLogin] Auth response:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      error: signInError?.message
    })

    if (signInError) {
      console.error('[TestLogin] Auth error:', signInError)
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      console.log('[TestLogin] Session established, redirecting to /')

      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('[TestLogin] Calling router.push("/")')
      router.push('/')
    } else {
      console.error('[TestLogin] No session in response')
      setError('No session returned from authentication')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="mb-4 text-2xl font-bold">Test Login</h1>
        <p className="mb-4 text-sm text-gray-600">For E2E testing only</p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded border p-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
