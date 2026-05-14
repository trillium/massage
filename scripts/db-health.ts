#!/usr/bin/env tsx

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const tenant = (process.env.TENANT_SLUG || 'your_tenant_schema') as 'public'

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const tenantClient = createClient(url, key, { db: { schema: tenant } })
const publicClient = createClient(url, key)

let passed = 0
let failed = 0

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    console.log(`  ✓ ${name}`)
    passed++
  } catch (err) {
    console.error(`  ✗ ${name}: ${err instanceof Error ? err.message : err}`)
    failed++
  }
}

console.log('\nDB Health Check\n')

console.log('google_oauth_apps (public):')
await check('row exists', async () => {
  const { data, error } = await publicClient
    .from('google_oauth_apps')
    .select('name, client_id, client_secret')
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('no rows found')
  if (!data.client_id) throw new Error('client_id is empty')
  if (!data.client_secret) throw new Error('client_secret is empty')
})

console.log('\ngoogle_credentials (tenant):')
await check('row exists', async () => {
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) throw new Error('OWNER_EMAIL not set')
  const { data, error } = await tenantClient
    .from('google_credentials')
    .select('email, refresh_token, access_token, expiry_date')
    .eq('email', ownerEmail)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error(`no row for ${ownerEmail}`)
  if (!data.refresh_token) throw new Error('refresh_token is empty')
})

await check('token exchange succeeds', async () => {
  const ownerEmail = process.env.OWNER_EMAIL!
  const { data: creds } = await tenantClient
    .from('google_credentials')
    .select('refresh_token')
    .eq('email', ownerEmail)
    .maybeSingle()
  const { data: app } = await publicClient
    .from('google_oauth_apps')
    .select('client_id, client_secret')
    .limit(1)
    .maybeSingle()

  if (!creds?.refresh_token) throw new Error('no refresh_token')
  if (!app?.client_id || !app?.client_secret) throw new Error('no oauth app credentials')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: creds.refresh_token,
      client_id: app.client_id,
      client_secret: app.client_secret,
    }).toString(),
    cache: 'no-cache',
  })
  const json = await res.json()
  if (!json.access_token) throw new Error(`token exchange failed: ${JSON.stringify(json)}`)
})

console.log('\npublic.profiles:')
await check('admin profile exists', async () => {
  const { data, error } = await publicClient
    .from('profiles')
    .select('email, role')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('no admin profile found')
})

console.log(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
