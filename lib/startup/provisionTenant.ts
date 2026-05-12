const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const tenantSlug = process.env.TENANT_SLUG
const tenantDomain = process.env.TENANT_DOMAIN ?? null
const ownerEmail = process.env.OWNER_EMAIL ?? null
const managementApiToken = process.env.SUPABASE_MANAGEMENT_API_TOKEN ?? null

let provisioned = false

function mgmtAuthHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function parseRedirectUrls(raw: string): string[] {
  return raw
    .split('\n')
    .map((u) => u.trim())
    .filter(Boolean)
}

function managementApiConfig(): {
  configUrl: string
  headers: Record<string, string>
  callbackUrl: string
  connectUrl: string
} | null {
  if (!managementApiToken) {
    console.info('[registerRedirectUrls] skipped — SUPABASE_MANAGEMENT_API_TOKEN not set')
    return null
  }
  if (!tenantDomain) {
    console.info('[registerRedirectUrls] skipped — TENANT_DOMAIN not set')
    return null
  }
  if (!supabaseUrl) return null
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  return {
    configUrl: `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
    headers: mgmtAuthHeaders(managementApiToken),
    callbackUrl: `https://${tenantDomain}/auth/callback/supabase`,
    connectUrl: `https://${tenantDomain}/auth/callback/connect-google`,
  }
}

async function fetchCurrentRedirectUrls(
  configUrl: string,
  headers: Record<string, string>
): Promise<string[] | null> {
  const res = await fetch(configUrl, { headers })
  if (!res.ok) {
    console.warn(`[registerRedirectUrls] GET config failed (${res.status})`)
    return null
  }
  const config = await res.json()
  return parseRedirectUrls(config.additional_redirect_urls ?? '')
}

async function patchRedirectUrls(
  configUrl: string,
  headers: Record<string, string>,
  merged: string
): Promise<void> {
  const res = await fetch(configUrl, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ additional_redirect_urls: merged }),
  })
  if (!res.ok) console.warn(`[registerRedirectUrls] PATCH config failed (${res.status})`)
  else console.info('[registerRedirectUrls] redirect URLs registered')
}

export async function registerRedirectUrls(): Promise<void> {
  const cfg = managementApiConfig()
  if (!cfg) return

  const { configUrl, headers, callbackUrl, connectUrl } = cfg

  try {
    const existing = await fetchCurrentRedirectUrls(configUrl, headers)
    if (!existing) return

    if (existing.includes(callbackUrl) && existing.includes(connectUrl)) {
      console.info('[registerRedirectUrls] redirect URLs already registered')
      return
    }

    const merged = [...new Set([...existing, callbackUrl, connectUrl])].join('\n')
    await patchRedirectUrls(configUrl, headers, merged)
  } catch (err) {
    console.warn('[registerRedirectUrls] failed:', err)
  }
}

function provisionConfig(): { url: string; key: string; slug: string } | null {
  if (!supabaseUrl || !serviceRoleKey || !tenantSlug) return null
  return { url: supabaseUrl, key: serviceRoleKey, slug: tenantSlug }
}

export async function provisionTenant(): Promise<void> {
  if (provisioned) return
  const cfg = provisionConfig()
  if (!cfg) return

  const { url, key } = cfg

  try {
    const res = await fetch(`${url}/rest/v1/rpc/create_tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
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
