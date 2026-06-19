import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCookieOptionsWithDomain } from '@/lib/supabase/cookie-options'
import { saveGoogleCredentials } from '@/lib/google/credentials'
import type { Session } from '@supabase/supabase-js'

const NEXT_PATH = '/admin/connect-google'
const LOG = '[connect-google/callback]'

function redirectTo(origin: string, path: string) {
  return NextResponse.redirect(`${origin}${path}`)
}

function getOrigin(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
  const proto = request.headers.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
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
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, getCookieOptionsWithDomain(options))
          })
        },
      },
    }
  )
  return supabase.auth.exchangeCodeForSession(code)
}

async function handleGoogleConnect(session: Session, origin: string) {
  console.log(LOG, 'session.user.email:', session.user?.email)
  console.log(LOG, 'provider_token present:', !!session.provider_token)
  console.log(LOG, 'provider_refresh_token present:', !!session.provider_refresh_token)
  console.log(LOG, 'expires_at:', session.expires_at)

  if (!session.provider_token || !session.user?.email) {
    console.error(
      LOG,
      'missing_tokens — provider_token:',
      !!session.provider_token,
      'email:',
      session.user?.email
    )
    return redirectTo(origin, `${NEXT_PATH}?error=missing_tokens`)
  }
  try {
    console.log(LOG, 'saving credentials for', session.user.email)
    await saveGoogleCredentials({
      email: session.user.email,
      access_token: session.provider_token,
      refresh_token: session.provider_refresh_token ?? '',
      expiry_date: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600 * 1000,
    })
    console.log(LOG, 'credentials saved successfully')
    return redirectTo(
      origin,
      `${NEXT_PATH}?connected=1&email=${encodeURIComponent(session.user.email)}`
    )
  } catch (err) {
    console.error(LOG, 'failed to save credentials:', err)
    return redirectTo(origin, `${NEXT_PATH}?error=callback_failed`)
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const origin = getOrigin(request)

  console.log(LOG, 'received — origin:', origin, 'code present:', !!code, 'error:', error)

  if (error) {
    console.error(LOG, 'OAuth error param:', error)
    return redirectTo(origin, `${NEXT_PATH}?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    console.error(LOG, 'no code param')
    return redirectTo(origin, `${NEXT_PATH}?error=authentication_failed`)
  }

  console.log(LOG, 'exchanging code for session...')
  const {
    data: { session },
    error: exchangeError,
  } = await exchangeCode(code)

  console.log(
    LOG,
    'exchange result — session present:',
    !!session,
    'error:',
    exchangeError?.message
  )

  if (exchangeError || !session) {
    console.error(LOG, 'code exchange failed:', exchangeError)
    return redirectTo(origin, `${NEXT_PATH}?error=authentication_failed`)
  }

  return handleGoogleConnect(session, origin)
}
