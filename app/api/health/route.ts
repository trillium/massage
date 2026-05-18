import { createClient } from '@supabase/supabase-js'
import { healthResponse, type OverallStatus } from '@/lib/health/shared'

export const dynamic = 'force-dynamic'

type TenantStatus = 'ready' | 'no_owner_seeded' | 'unprovisioned' | 'not_configured'

interface SimpleCheck {
  ok: boolean
  detail?: string
}

interface HealthChecks {
  config: { ok: boolean; warnings: string[] }
  supabase: SimpleCheck
  provisioning: { ok: boolean; tenant: TenantStatus }
  google: SimpleCheck
  management_api: SimpleCheck
}

function checkConfig() {
  const slug = process.env.TENANT_SLUG ?? ''
  const publicSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? ''
  const warnings: string[] = []

  if (slug && /[A-Z\s]/.test(slug)) {
    warnings.push('TENANT_SLUG contains uppercase or spaces — use snake_case')
  }
  if (slug && publicSlug && slug !== publicSlug) {
    warnings.push('TENANT_SLUG and NEXT_PUBLIC_TENANT_SLUG do not match')
  }

  return { ok: warnings.length === 0, warnings }
}

async function checkProvisioning(): Promise<{ ok: boolean; tenant: TenantStatus }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const slug = process.env.TENANT_SLUG
  if (!url || !key || !slug) return { ok: false, tenant: 'not_configured' }

  try {
    const res = await fetch(`${url}/rest/v1/admin_emails?select=email&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': slug },
    })
    if (!res.ok) return { ok: false, tenant: 'unprovisioned' }
    const rows = await res.json()
    const tenant: TenantStatus =
      Array.isArray(rows) && rows.length > 0 ? 'ready' : 'no_owner_seeded'
    return { ok: tenant === 'ready', tenant }
  } catch {
    return { ok: false, tenant: 'unprovisioned' }
  }
}

async function checkGoogle(): Promise<SimpleCheck> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const slug = process.env.TENANT_SLUG
  if (!url || !key || !slug) return { ok: false, detail: 'tenant not configured' }

  try {
    const res = await fetch(`${url}/rest/v1/google_credentials?select=email&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': slug },
    })
    if (!res.ok) return { ok: false, detail: 'google_credentials table not found' }
    const rows = await res.json()
    if (Array.isArray(rows) && rows.length > 0) return { ok: true }
    return { ok: false, detail: 'no credentials found — visit /admin/connect-google' }
  } catch {
    return { ok: false, detail: 'unable to query google_credentials' }
  }
}

function checkManagementApi(): SimpleCheck {
  if (process.env.SUPABASE_MANAGEMENT_API_TOKEN) return { ok: true }
  return {
    ok: false,
    detail: 'SUPABASE_MANAGEMENT_API_TOKEN not set — redirect URLs must be registered manually',
  }
}

function deriveStatus(checks: HealthChecks): OverallStatus {
  if (!checks.config.ok) return 'degraded'
  if (!checks.supabase.ok) return 'degraded'
  if (!checks.provisioning.ok) return 'degraded'
  return 'ok'
}

function skippedChecks(detail: string) {
  return {
    supabase: { ok: false, detail },
    provisioning: { ok: false, tenant: 'not_configured' as TenantStatus },
    google: { ok: false, detail: 'skipped' },
  }
}

export async function GET() {
  const config = checkConfig()
  const management_api = checkManagementApi()

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { db: { schema: process.env.TENANT_SLUG || 'public' } }
    )

    const { error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
      return healthResponse(
        {
          status: 'degraded' as OverallStatus,
          checks: { config, management_api, ...skippedChecks(error.message) },
        },
        503
      )
    }

    const [provisioning, google] = await Promise.all([checkProvisioning(), checkGoogle()])
    const checks: HealthChecks = {
      config,
      supabase: { ok: true },
      provisioning,
      google,
      management_api,
    }
    const status = deriveStatus(checks)

    return healthResponse({ status, checks }, status === 'ok' ? 200 : 503)
  } catch {
    return healthResponse(
      {
        status: 'error' as OverallStatus,
        checks: { config, management_api, ...skippedChecks('unreachable') },
      },
      503
    )
  }
}
