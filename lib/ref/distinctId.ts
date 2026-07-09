/**
 * Resolve a visitor's PostHog distinct_id from the request cookies.
 *
 * posthog-js persists state in a cookie named `ph_<projectApiKey>_posthog`
 * whose value is URL-encoded JSON holding `distinct_id`. We match the cookie by
 * shape (not by a hardcoded key) so this stays PostHog-instance-agnostic.
 */

const PH_COOKIE = /^ph_.+_posthog$/

export function parseCookieHeader(header: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const name = part.slice(0, eq).trim()
    if (name) out[name] = part.slice(eq + 1).trim()
  }
  return out
}

export function distinctIdFromCookieValue(raw: string | undefined): string | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    const id = parsed?.distinct_id
    return typeof id === 'string' && id.length > 0 ? id : null
  } catch {
    return null
  }
}

export function distinctIdFromCookieRecord(cookies: Record<string, string>): string | null {
  const name = Object.keys(cookies).find((key) => PH_COOKIE.test(key))
  return name ? distinctIdFromCookieValue(cookies[name]) : null
}

export function distinctIdFromCookieHeader(header: string | null | undefined): string | null {
  return distinctIdFromCookieRecord(parseCookieHeader(header))
}
