import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type TenantStatus = 'ready' | 'no_owner_seeded' | 'unprovisioned' | 'not_configured'

async function queryAdminEmails(
  url: string,
  key: string,
  slug: string
): Promise<'ready' | 'no_owner_seeded' | 'unprovisioned'> {
  try {
    const res = await fetch(`${url}/rest/v1/admin_emails?select=email&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': slug },
    })
    if (!res.ok) return 'unprovisioned'
    const rows = await res.json()
    return Array.isArray(rows) && rows.length > 0 ? 'ready' : 'no_owner_seeded'
  } catch {
    return 'unprovisioned'
  }
}

async function checkTenant(): Promise<TenantStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const slug = process.env.TENANT_SLUG
  if (!url || !key || !slug) return 'not_configured'
  return queryAdminEmails(url, key, slug)
}

function tenantHttpStatus(tenant: TenantStatus): number {
  return tenant === 'unprovisioned' || tenant === 'no_owner_seeded' ? 503 : 200
}

export async function GET() {
  const timestamp = new Date().toISOString()

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { db: { schema: process.env.TENANT_SLUG || 'public' } }
    )

    const { error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
      return NextResponse.json(
        { status: 'degraded', timestamp, supabase: 'error', detail: error.message },
        { status: 503 }
      )
    }

    const tenant = await checkTenant()
    const httpStatus = tenantHttpStatus(tenant)

    return NextResponse.json(
      { status: httpStatus === 200 ? 'ok' : 'degraded', timestamp, supabase: 'connected', tenant },
      { status: httpStatus }
    )
  } catch {
    return NextResponse.json(
      { status: 'error', timestamp, supabase: 'unreachable' },
      { status: 503 }
    )
  }
}
