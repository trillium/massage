const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const tenantSlug = process.env.TENANT_SLUG
const tenantDomain = process.env.TENANT_DOMAIN ?? null
const ownerEmail = process.env.OWNER_EMAIL ?? null

let provisioned = false

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
  } catch (err) {
    console.warn(`[provisionTenant] skipped — Supabase unreachable:`, err)
  }
}
