'use client'

import { getSupabaseBrowserClient } from './client'
import type {
  Provider,
  AuthOtpResponse,
  AuthResponse,
  OAuthResponse,
  AuthTokenResponsePassword,
  AuthError,
  Session,
  User,
  UserResponse,
} from '@supabase/supabase-js'

export async function signInWithMagicLink(
  email: string,
  redirectTo?: string
): Promise<AuthOtpResponse> {
  const supabase = getSupabaseBrowserClient()

  const callbackUrl = new URL('/auth/callback/supabase', window.location.origin)
  if (redirectTo) {
    callbackUrl.searchParams.set('next', redirectTo)
  }

  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  })
}

export async function signInWithOAuth(
  provider: Provider,
  redirectTo?: string
): Promise<OAuthResponse> {
  const supabase = getSupabaseBrowserClient()

  const callbackUrl = new URL('/auth/callback/supabase', window.location.origin)
  if (redirectTo) {
    callbackUrl.searchParams.set('next', redirectTo)
  }

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthTokenResponsePassword> {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthResponse> {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback/supabase`,
    },
  })
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getClientSession(): Promise<Session | null> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getClientUser(): Promise<User | null> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getClientProfile() {
  const supabase = getSupabaseBrowserClient()
  const user = await getClientUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return profile
}

export async function isClientAdmin() {
  const profile = await getClientProfile()
  return profile?.role === 'admin'
}

export function onAuthStateChange(callback: (event: string, session: any) => void): () => void {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return () => subscription.unsubscribe()
}

export async function updateEmail(newEmail: string): Promise<UserResponse> {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.updateUser({ email: newEmail })
}

export async function updatePassword(newPassword: string): Promise<UserResponse> {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.updateUser({ password: newPassword })
}

export async function resetPassword(
  email: string
): Promise<{ data: {} | null; error: AuthError | null }> {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
}
