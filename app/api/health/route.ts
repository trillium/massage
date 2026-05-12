import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type TenantStatus = 'ready' | 'no_owner_seeded' | 'unprovisioned' | 'not_configured'

// fallow-ignore-next-line complexity
async function checkTenant(): Promise<TenantStatus> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const tenantSlug = process.env.TENANT_SLUG

  if (!supabaseUrl || !serviceRoleKey || !tenantSlug) return 'not_configured'

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/admin_emails?select=email&limit=1`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Accept-Profile': tenantSlug,
      },
    })

    if (!res.ok) return 'unprovisioned'

    const rows = await res.json()
    return Array.isArray(rows) && rows.length > 0 ? 'ready' : 'no_owner_seeded'
  } catch {
    return 'unprovisioned'
  }
}

// fallow-ignore-next-line complexity
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
    const httpStatus = tenant === 'unprovisioned' || tenant === 'no_owner_seeded' ? 503 : 200

    return NextResponse.json(
      { status: httpStatus === 200 ? 'ok' : 'degraded', timestamp, supabase: 'connected', tenant },
      { status: httpStatus }
    )
  } catch (err) {
    return NextResponse.json(
      { status: 'error', timestamp, supabase: 'unreachable' },
      { status: 503 }
    )
  }
}
