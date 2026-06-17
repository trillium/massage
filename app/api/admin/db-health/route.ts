import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type CheckResult = { ok: boolean; detail?: string }

async function runCheck(fn: () => Promise<void>): Promise<CheckResult> {
  try {
    await fn()
    return { ok: true }
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : String(err) }
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const tenant = process.env.TENANT_SLUG || 'public'
  const ownerEmail = process.env.OWNER_EMAIL

  if (!url || !key) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' },
      { status: 500 }
    )
  }

  const tenantClient = createClient(url, key, { db: { schema: tenant as 'public' } })

  const checks: Record<string, CheckResult> = {}

  checks.google_oauth_app = await runCheck(async () => {
    if (!process.env.GOOGLE_OAUTH_CLIENT_ID) throw new Error('GOOGLE_OAUTH_CLIENT_ID not set')
    if (!process.env.GOOGLE_OAUTH_SECRET) throw new Error('GOOGLE_OAUTH_SECRET not set')
  })

  checks.google_credentials = await runCheck(async () => {
    if (!ownerEmail) throw new Error('OWNER_EMAIL env var not set')
    const { data, error } = await tenantClient
      .from('google_credentials')
      .select('email, refresh_token, access_token, expiry_date')
      .eq('email', ownerEmail)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error(`no row for ${ownerEmail} in ${tenant}.google_credentials`)
    if (!data.refresh_token) throw new Error('refresh_token is empty')
  })

  checks.token_exchange = await runCheck(async () => {
    if (!ownerEmail) throw new Error('OWNER_EMAIL env var not set')
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
    const clientSecret = process.env.GOOGLE_OAUTH_SECRET
    if (!clientId || !clientSecret) throw new Error('Google OAuth env vars not set')
    const { data: creds } = await tenantClient
      .from('google_credentials')
      .select('refresh_token')
      .eq('email', ownerEmail)
      .maybeSingle()
    if (!creds?.refresh_token) throw new Error('no refresh_token in DB')
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: creds.refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      cache: 'no-cache',
    })
    const json = await res.json()
    if (!json.access_token) throw new Error(`token exchange failed: ${JSON.stringify(json)}`)
  })

  const publicClient = createClient(url, key)

  checks.admin_profile = await runCheck(async () => {
    const { data, error } = await publicClient
      .from('profiles')
      .select('email, role')
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error('no admin profile found in public.profiles')
  })

  const allOk = Object.values(checks).every((c) => c.ok)

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      env: { tenant, ownerEmail: ownerEmail ?? '(not set)' },
      checks,
    },
    { status: allOk ? 200 : 503 }
  )
}
