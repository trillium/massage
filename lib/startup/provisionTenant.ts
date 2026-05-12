const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const tenantSlug = process.env.TENANT_SLUG
const tenantDomain = process.env.TENANT_DOMAIN ?? null
const ownerEmail = process.env.OWNER_EMAIL ?? null
const managementApiToken = process.env.SUPABASE_MANAGEMENT_API_TOKEN ?? null

let provisioned = false

export async function registerRedirectUrls(): Promise<void> {
  if (!managementApiToken || !tenantDomain) {
    if (!managementApiToken)
      console.info('[registerRedirectUrls] skipped — SUPABASE_MANAGEMENT_API_TOKEN not set')
    if (!tenantDomain) console.info('[registerRedirectUrls] skipped — TENANT_DOMAIN not set')
    return
  }

  if (!supabaseUrl) return

  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const configUrl = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`
  const authHeaders = {
    Authorization: `Bearer ${managementApiToken}`,
    'Content-Type': 'application/json',
  }

  const callbackUrl = `https://${tenantDomain}/auth/callback/supabase`
  const connectUrl = `https://${tenantDomain}/auth/callback/connect-google`

  try {
    const getRes = await fetch(configUrl, { headers: authHeaders })
    if (!getRes.ok) {
      console.warn(`[registerRedirectUrls] GET config failed (${getRes.status})`)
      return
    }

    const config = await getRes.json()
    const existingRaw: string = config.additional_redirect_urls ?? ''
    const existing = existingRaw
      .split('\n')
      .map((u: string) => u.trim())
      .filter(Boolean)

    const hasCallback = existing.includes(callbackUrl)
    const hasConnect = existing.includes(connectUrl)

    if (hasCallback && hasConnect) {
      console.info('[registerRedirectUrls] redirect URLs already registered')
      return
    }

    const merged = [...new Set([...existing, callbackUrl, connectUrl])].join('\n')

    const patchRes = await fetch(configUrl, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ additional_redirect_urls: merged }),
    })

    if (!patchRes.ok) {
      console.warn(`[registerRedirectUrls] PATCH config failed (${patchRes.status})`)
      return
    }

    console.info('[registerRedirectUrls] redirect URLs registered')
  } catch (err) {
    console.warn('[registerRedirectUrls] failed:', err)
  }
}

export async function provisionTenant(): Promise<void> {
  if (provisioned) return
  if (!supabaseUrl || !serviceRoleKey || !tenantSlug) return

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/create_tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        p_tenant_slug: tenantSlug,
        p_domain: tenantDomain,
        p_owner_email: ownerEmail,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.warn(`[provisionTenant] create_tenant failed (${res.status}): ${body}`)
      return
    }

    provisioned = true
    console.info(`[provisionTenant] tenant '${tenantSlug}' ready`)

    await registerRedirectUrls()
  } catch (err) {
    console.warn(`[provisionTenant] skipped — Supabase unreachable:`, err)
  }
}
