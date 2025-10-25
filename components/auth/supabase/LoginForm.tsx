/**
 * Supabase Login Form
 *
 * Simple email-based login using magic links.
 * Can be customized for password auth or OAuth.
 *
 * Usage:
 * <LoginForm redirectTo="/admin" />
 */

'use client'

import { useState } from 'react'
import { signInWithMagicLink } from '@/lib/supabase/auth-helpers'

interface LoginFormProps {
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function LoginForm({ redirectTo, onSuccess, onError }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
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
        <p className="mt-2 text-sm text-green-600">Click the link to sign in.</p>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="you@example.com"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
      >
        {loading ? 'Sending...' : 'Send magic link'}
      </button>

      <p className="text-sm text-gray-600">
        We will send you a secure sign-in link to your email. No password needed.
      </p>
    </form>
  )
}
