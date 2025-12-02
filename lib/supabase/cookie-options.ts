import type { CookieOptions } from '@supabase/ssr'

export function getCookieOptionsWithDomain(
  options: CookieOptions | undefined
): CookieOptions | undefined {
  const cookieDomain = process.env.COOKIE_DOMAIN

  if (!cookieDomain || !options) {
    return options
  }

  return {
    ...options,
    domain: cookieDomain,
  }
}
