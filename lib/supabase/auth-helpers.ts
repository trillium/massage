/**
 * Auth Helper Functions
 *
 * Convenience functions for common auth operations.
 * Use these in your components and API routes.
 */

'use client'

import { getSupabaseBrowserClient } from './client'
import type { Provider } from '@supabase/supabase-js'

/**
 * Sign in with magic link (email)
 * Sends a magic link to the user's email
 */
export async function signInWithMagicLink(email: string, redirectTo?: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback/supabase`,
    },
  })

  return { data, error }
}

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 */
export async function signInWithOAuth(provider: Provider, redirectTo?: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback/supabase`,
    },
  })

  return { data, error }
}

/**
 * Sign in with email and password
 * Note: Requires password auth to be enabled in Supabase
 */
export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

/**
 * Sign up with email and password
 * Note: Requires password auth to be enabled in Supabase
 */
export async function signUpWithPassword(email: string, password: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback/supabase`,
    },
  })

  return { data, error }
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get current session (client-side)
 */
export async function getClientSession() {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Get current user (client-side)
 */
export async function getClientUser() {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get current user's profile (client-side)
 */
export async function getClientProfile() {
  const supabase = getSupabaseBrowserClient()
  const user = await getClientUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return profile
}

/**
 * Check if current user is admin (client-side)
 */
export async function isClientAdmin() {
  const profile = await getClientProfile()
  return profile?.role === 'admin'
}

/**
 * Listen to auth state changes
 * Returns unsubscribe function
 */
export function onAuthStateChange(callback: (event: string, session: any) => void): () => void {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return () => subscription.unsubscribe()
}

/**
 * Update user email
 */
export async function updateEmail(newEmail: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.auth.updateUser({ email: newEmail })
  return { data, error }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return { data, error }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  return { data, error }
}
