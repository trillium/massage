/**
 * Referral tag endpoint. The client pings this on a visit carrying ?ref so the
 * SERVER (which holds the write key) tags the visitor's PostHog person.
 *
 * Thin adapter: reads the ref param + resolves distinct_id from the ph_* cookie,
 * then delegates to the portable tagReferral() lib. The PostHog instance is
 * chosen from the request host to mirror the client (AnalyticsContext) so the
 * tag lands on the same project the browser is tracking.
 */

import { NextRequest, NextResponse } from 'next/server'
import { siteConfig } from '@/lib/siteConfig'
import { tagReferral } from '@/lib/ref/serverRefTag'
import { distinctIdFromCookieHeader } from '@/lib/ref/distinctId'
import { refParam } from '@/lib/ref/refConfig'
import type { PosthogEnv } from '@/lib/ref/refServerConfig'

// posthog-node needs the Node runtime; never cache this per-visitor call.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Mirror AnalyticsContext: prod domain → prod, dev/test/admin subdomain → dev. */
function envForHost(hostname: string | null | undefined): PosthogEnv | undefined {
  if (!hostname) return undefined
  const base = new URL(siteConfig.domain.siteUrl).hostname
  const isDevSubdomain =
    hostname === `test.${base}` || hostname === `admin.${base}` || hostname === `dev.${base}`
  const isProdDomain = hostname.endsWith(base) && !isDevSubdomain
  return isProdDomain ? 'prod' : 'dev'
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get(refParam())
  const distinctId = distinctIdFromCookieHeader(request.headers.get('cookie'))
  const result = await tagReferral(
    { refToken: token, distinctId },
    { env: envForHost(request.nextUrl.hostname) }
  )
  return NextResponse.json(result)
}
