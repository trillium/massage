/**
 * Supabase Auth Callback Route
 *
 * Handles the redirect after:
 * - Magic link authentication
 * - OAuth authentication
 * - Email verification
 * - Password reset
 *
 * This route exchanges the auth code for a session.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/supabase-login?error=${encodeURIComponent(error)}`
    )
  }

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/supabase-login?error=authentication_failed`
      )
    }

    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  }

  console.warn('Auth callback called without code or error')
  return NextResponse.redirect(`${requestUrl.origin}/auth/supabase-login`)
}
