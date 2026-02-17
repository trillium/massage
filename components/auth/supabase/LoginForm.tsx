'use client'

import { useState } from 'react'
import { signInWithOAuth, signInWithMagicLink } from '@/lib/supabase/auth-helpers'

interface LoginFormProps {
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function LoginForm({ redirectTo: rawRedirectTo, onSuccess, onError }: LoginFormProps) {
  const redirectTo = rawRedirectTo?.startsWith('/') ? rawRedirectTo : undefined
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    const { error: oauthError } = await signInWithOAuth('google', redirectTo)
    setLoading(false)
    if (oauthError) {
      setError(oauthError.message)
      onError?.(oauthError)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: signInError } = await signInWithMagicLink(email, redirectTo)
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
      onError?.(signInError)
    } else {
      setSubmitted(true)
      onSuccess?.()
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="font-medium text-green-900">Check your email</h3>
        <p className="mt-1 text-sm text-green-700">
          We sent a magic link to <strong>{email}</strong>
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setEmail('')
          }}
          className="mt-3 text-sm text-green-600 underline hover:text-green-700"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>

      {error && (
        <div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            or
          </span>
        </div>
      </div>

      {showEmail ? (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowEmail(true)}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Sign in with email instead
        </button>
      )}
    </div>
  )
}
