/**
 * Supabase Server Client
 *
 * Use this in Server Components, Server Actions, and API Routes.
 * This client reads/writes cookies for session management.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Get current user from server
 * Returns null if not authenticated
 */
export async function getUser() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get current user session from server
 * Returns null if no active session
 */
export async function getSession() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Get current user's profile from database
 * Returns null if not authenticated or profile doesn't exist
 */
export async function getUserProfile() {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return profile
}

/**
 * Check if current user is admin
 * Returns false if not authenticated or not admin
 */
export async function isAdmin() {
  const profile = await getUserProfile()
  return profile?.role === 'admin'
}

/**
 * Admin-only server client
 * Uses service role key for elevated permissions
 * ONLY use this in server-side code, never expose to browser!
 */
export function getSupabaseAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}
