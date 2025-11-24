/**
 * Next.js Proxy for Supabase Auth
 *
 * This proxy:
 * 1. Refreshes the user's session on each request
 * 2. Updates auth cookies
 * 3. Protects routes that require authentication
 * 4. Redirects unauthenticated users to login
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DEBUG = process.env.PROXY_DEBUG === 'true'

function log(...args: any[]) {
  if (DEBUG) {
    console.log(...args)
  }
}

export default async function proxy(request: NextRequest) {
  log('[Proxy] ==========================================')
  log('[Proxy] Request:', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  log('[Proxy] User authenticated:', !!user, user?.email)

  // Protected routes - require authentication
  const protectedPaths = ['/admin', '/my_events']

  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // If accessing protected path without authentication, redirect to login
  if (isProtectedPath && !user) {
    log('[Proxy] Unauthenticated access to protected path - redirecting')
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Admin-only routes
  const adminPaths = ['/admin']
  const isAdminPath = adminPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isAdminPath && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    log('[Proxy] Admin check:', profile?.role)

    if (profile?.role !== 'admin') {
      log('[Proxy] Non-admin user denied access to admin route')
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so: const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so: myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing the cookies!
  // 4. Finally: return myNewResponse
  // If this is not done, you may be causing the browser and server to go out of sync and terminate the user's session prematurely!

  log('[Proxy] Request allowed')
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
