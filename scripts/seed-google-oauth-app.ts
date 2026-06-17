#!/usr/bin/env tsx

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const tenant = process.env.TENANT_SLUG || 'your_tenant_schema'
const clientId = process.env.SUPABASE_GOOGLE_ID
const clientSecret = process.env.SUPABASE_GOOGLE_CLIENT_SECRET
const name = process.env.GOOGLE_OAUTH_APP_NAME || 'default'

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!clientId || !clientSecret) {
  console.error('Missing SUPABASE_GOOGLE_ID or SUPABASE_GOOGLE_CLIENT_SECRET')
  process.exit(1)
}

const supabase = createClient(url, key)

const { error } = await supabase
  .from('google_oauth_apps')
  .upsert({ name, client_id: clientId, client_secret: clientSecret }, { onConflict: 'name' })

if (error) {
  console.error('Failed to seed google_oauth_apps:', error.message)
  process.exit(1)
}

console.log(`google_oauth_apps row upserted: name="${name}"`)
console.log('GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_SECRET can now be removed from env vars.')
