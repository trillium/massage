import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCookieOptionsWithDomain } from '@/lib/supabase/cookie-options'
import { saveGoogleCredentials } from '@/lib/google/credentials'
import type { Session } from '@supabase/supabase-js'

function redirectTo(origin: string, path: string) {
  return NextResponse.redirect(`${origin}${path}`)
}

async function exchangeCode(code: string) {
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
            cookieStore.set(name, value, getCookieOptionsWithDomain(options))
          )
        },
      },
    }
  )
  return supabase.auth.exchangeCodeForSession(code)
}

function buildCredentials(session: Session) {
  return {
    email: session.user!.email!,
    access_token: session.provider_token!,
    refresh_token: session.provider_refresh_token ?? '',
    expiry_date: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600 * 1000,
  }
}

async function handleGoogleConnect(session: Session, origin: string, next: string) {
  if (!session.provider_token || !session.user?.email) {
    return redirectTo(origin, `${next}?error=missing_tokens`)
  }
  try {
    await saveGoogleCredentials(buildCredentials(session))
    return redirectTo(origin, `${next}?connected=1&email=${encodeURIComponent(session.user.email)}`)
  } catch (err) {
    console.error('Failed to save Google credentials:', err)
    return redirectTo(origin, `${next}?error=callback_failed`)
  }
}

async function handleCodeExchange(code: string, requestUrl: URL, next: string) {
  const origin = requestUrl.origin
  const {
    data: { session },
    error: exchangeError,
  } = await exchangeCode(code)

  if (exchangeError) {
    console.error('Error exchanging code for session:', exchangeError)
    return redirectTo(origin, '/auth/supabase-login?error=authentication_failed')
  }

  const connectGoogle = requestUrl.searchParams.get('connect_google')
  if (connectGoogle === '1' && session) {
    return handleGoogleConnect(session, origin, next)
  }

  return redirectTo(origin, next)
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return redirectTo(origin, `/auth/supabase-login?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    console.warn('Auth callback called without code or error')
    return redirectTo(origin, '/auth/supabase-login')
  }

  return handleCodeExchange(code, requestUrl, next)
}
