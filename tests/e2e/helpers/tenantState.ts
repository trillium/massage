function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const slug = process.env.TENANT_SLUG
  if (!url || !key || !slug) {
    throw new Error(
      'tenantState helpers require NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and TENANT_SLUG'
    )
  }
  return { url, key, slug }
}

function makeHeaders(key: string, slug: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Accept-Profile': slug,
    'Content-Profile': slug,
  }
}

async function assertOk(res: Response, context: string) {
  if (!res.ok) {
    const body = await res.text().catch(() => '<unreadable>')
    throw new Error(`${context}: ${res.status} ${res.statusText} — ${body}`)
  }
}

export async function ensureProvisioned(): Promise<void> {
  const { url, key, slug } = getEnv()
  const hdrs = makeHeaders(key, slug)

  const check = await fetch(`${url}/rest/v1/admin_emails?select=email&limit=1`, {
    headers: hdrs,
  })
  await assertOk(check, 'ensureProvisioned: failed to query admin_emails')

  const rows = await check.json()
  if (rows.length > 0) return

  const insert = await fetch(`${url}/rest/v1/admin_emails`, {
    method: 'POST',
    headers: hdrs,
    body: JSON.stringify({ email: 'test-owner@example.com' }),
  })
  await assertOk(insert, 'ensureProvisioned: failed to insert admin_emails row')
}

export async function ensureNoOwner(): Promise<void> {
  const { url, key, slug } = getEnv()
  const hdrs = makeHeaders(key, slug)

  const res = await fetch(`${url}/rest/v1/admin_emails?email=neq.null`, {
    method: 'DELETE',
    headers: hdrs,
  })
  await assertOk(res, 'ensureNoOwner: failed to delete admin_emails rows')
}

export async function ensureGoogleConnected(): Promise<void> {
  const { url, key, slug } = getEnv()
  const hdrs = makeHeaders(key, slug)

  const check = await fetch(`${url}/rest/v1/google_credentials?select=email&limit=1`, {
    headers: hdrs,
  })
  await assertOk(check, 'ensureGoogleConnected: failed to query google_credentials')

  const rows = await check.json()
  if (rows.length > 0) return

  const insert = await fetch(`${url}/rest/v1/google_credentials`, {
    method: 'POST',
    headers: hdrs,
    body: JSON.stringify({
      email: 'test@example.com',
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expiry_date: 9999999999000,
    }),
  })
  await assertOk(insert, 'ensureGoogleConnected: failed to insert google_credentials row')
}

export async function ensureGoogleDisconnected(): Promise<void> {
  const { url, key, slug } = getEnv()
  const hdrs = makeHeaders(key, slug)

  const res = await fetch(`${url}/rest/v1/google_credentials?email=neq.null`, {
    method: 'DELETE',
    headers: hdrs,
  })
  await assertOk(res, 'ensureGoogleDisconnected: failed to delete google_credentials rows')
}
