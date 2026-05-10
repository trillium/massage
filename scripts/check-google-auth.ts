#!/usr/bin/env tsx

/**
 * Google Auth Diagnostic Script
 *
 * Checks google_credentials table and admin profiles in Supabase.
 * Run with: pnpm tsx scripts/check-google-auth.ts
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const tenant = process.env.TENANT_SLUG || 'your_tenant_schema'

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { db: { schema: tenant as 'public' } })
const publicClient = createClient(url, key, { db: { schema: 'public' } })

async function main() {
  console.log(`\nSchema: ${tenant}\n`)

  const { data: creds, error: credsErr } = await supabase
    .from('google_credentials')
    .select('email, access_token, refresh_token, expiry_date, updated_at')

  if (credsErr) {
    console.error('google_credentials error:', credsErr.message)
  } else {
    console.log('google_credentials:')
    for (const row of creds ?? []) {
      console.log(
        ` ${row.email} | access_token: ${row.access_token ? 'set' : 'null'} | refresh_token: ${row.refresh_token ? 'set' : 'null'} | expires: ${row.expiry_date ? new Date(row.expiry_date).toISOString() : 'null'} | updated: ${row.updated_at}`
      )
    }
    if (!creds?.length) console.log('  (no rows)')
  }

  console.log('\npublic.profiles (admin only):')
  const { data: profiles, error: profilesErr } = await publicClient
    .from('profiles')
    .select('email, role')
    .eq('role', 'admin')

  if (profilesErr) {
    console.error('profiles error:', profilesErr.message)
  } else {
    for (const row of profiles ?? []) {
      console.log(` ${row.email} — ${row.role}`)
    }
  }

  console.log()
}

main()
