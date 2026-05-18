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

function getServiceEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }
  return { url, key }
}

export async function createTenantSchema(slug: string): Promise<void> {
  const { url, key } = getServiceEnv()

  const res = await fetch(`${url}/rest/v1/rpc/create_tenant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ p_tenant_slug: slug }),
  })
  await assertOk(res, `createTenantSchema(${slug})`)
}

export async function dropTenantSchema(slug: string): Promise<void> {
  const { url, key } = getServiceEnv()

  const res = await fetch(`${url}/rest/v1/rpc/drop_tenant_schema`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ p_schema_name: slug }),
  })

  if (!res.ok) {
    const sql = `DROP SCHEMA IF EXISTS "${slug}" CASCADE; DELETE FROM public.tenants WHERE tenant_slug = '${slug}'; DELETE FROM public.domains WHERE tenant_slug = '${slug}';`
    console.warn(`dropTenantSchema: RPC not available (${res.status}). Run manually:\n${sql}`)
  }
}

export async function seedAdminEmail(tenantSlug: string, email: string): Promise<void> {
  const { url, key } = getServiceEnv()
  const hdrs = makeHeaders(key, tenantSlug)

  const check = await fetch(
    `${url}/rest/v1/admin_emails?select=email&email=eq.${encodeURIComponent(email)}`,
    { headers: hdrs }
  )
  await assertOk(check, `seedAdminEmail: query failed`)

  const rows = await check.json()
  if (rows.length > 0) return

  const insert = await fetch(`${url}/rest/v1/admin_emails`, {
    method: 'POST',
    headers: hdrs,
    body: JSON.stringify({ email }),
  })
  await assertOk(insert, `seedAdminEmail: insert failed for ${email}`)
}

export async function createTestUser(email: string, password: string): Promise<void> {
  const { url, key } = getServiceEnv()

  const listRes = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=50`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  })
  await assertOk(listRes, 'createTestUser: list users failed')

  const { users } = await listRes.json()
  const existing = users?.find((u: { email: string }) => u.email === email)

  if (existing) {
    const updateRes = await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        password,
        email_confirm: true,
      }),
    })
    await assertOk(updateRes, 'createTestUser: update user failed')
    return
  }

  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  })
  await assertOk(createRes, 'createTestUser: create user failed')
}
