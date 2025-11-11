/**
 * Supabase Auth Callback Route
 *
 * Handles the redirect after:
 * - Magic link authentication
 * - OAuth authentication (Google, etc)
 * - Email verification
 * - Password reset
 *
 * This route exchanges the auth code for a session.
 * Follows Supabase's recommended Next.js pattern.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (error) {
    console.error('[Auth Callback] OAuth error received:', {
      error,
      errorCode,
      errorDescription,
      timestamp: new Date().toISOString(),
      url: request.url,
    })

    return NextResponse.redirect(
      `${origin}/auth/supabase-login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`
    )
  }

  if (!code) {
    console.warn('[Auth Callback] No code or error present in callback', {
      timestamp: new Date().toISOString(),
      url: request.url,
    })
    return NextResponse.redirect(`${origin}/auth/supabase-login`)
  }

  try {
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

    console.log('[Auth Callback] Attempting to exchange code for session', {
      timestamp: new Date().toISOString(),
      hasCode: !!code,
      codeLength: code?.length,
    })

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[Auth Callback] Error exchanging code for session:', {
        error: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name,
        stack: exchangeError.stack,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.redirect(
        `${origin}/auth/supabase-login?error=authentication_failed&error_description=${encodeURIComponent(exchangeError.message)}`
      )
    }

    console.log('[Auth Callback] Successfully exchanged code for session', {
      userId: data.user?.id,
      email: data.user?.email,
      provider: data.user?.app_metadata?.provider,
      timestamp: new Date().toISOString(),
    })

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  } catch (err) {
    console.error('[Auth Callback] Unexpected error during authentication:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.redirect(
      `${origin}/auth/supabase-login?error=unexpected_error&error_description=${encodeURIComponent(err instanceof Error ? err.message : 'Unknown error')}`
    )
  }
}
