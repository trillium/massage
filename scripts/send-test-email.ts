#!/usr/bin/env tsx

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const tenant = process.env.TENANT_SLUG || 'trillium_massage'
const ownerEmail = process.env.OWNER_EMAIL
const to = process.argv[2] || ownerEmail

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!ownerEmail) {
  console.error('Missing OWNER_EMAIL')
  process.exit(1)
}

console.log(`\nTenant: ${tenant}`)
console.log(`Sending as: ${ownerEmail}`)
console.log(`Sending to: ${to}\n`)

const publicClient = createClient(url, key)
const tenantClient = createClient(url, key, { db: { schema: tenant as 'public' } })

// Step 1: load OAuth app
const { data: app, error: appErr } = await publicClient
  .from('google_oauth_apps')
  .select('name, client_id, client_secret')
  .limit(1)
  .maybeSingle()

if (appErr || !app) {
  console.error('✗ google_oauth_apps:', appErr?.message ?? 'no row found')
  process.exit(1)
}
console.log(`✓ OAuth app: "${app.name}" (client_id: ...${app.client_id.slice(-8)})`)

// Step 2: load refresh token
const { data: creds, error: credsErr } = await tenantClient
  .from('google_credentials')
  .select('email, refresh_token, expiry_date')
  .eq('email', ownerEmail)
  .maybeSingle()

if (credsErr || !creds) {
  console.error('✗ google_credentials:', credsErr?.message ?? `no row for ${ownerEmail}`)
  process.exit(1)
}
console.log(
  `✓ Credentials: ${creds.email}, refresh_token: ${creds.refresh_token ? 'set' : 'MISSING'}, expiry: ${creds.expiry_date ? new Date(creds.expiry_date).toISOString() : 'null'}`
)

if (!creds.refresh_token) {
  console.error('✗ No refresh token — reconnect Google at /admin/connect-google')
  process.exit(1)
}

// Step 3: exchange for access token
const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
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
const tokenJson = await tokenRes.json()

if (!tokenJson.access_token) {
  console.error('✗ Token exchange failed:', JSON.stringify(tokenJson))
  process.exit(1)
}
console.log(`✓ Token exchange: access_token obtained (scope: ${tokenJson.scope ?? 'unknown'})`)

// Step 4: send via Gmail REST API
const subject = `Test email from ${tenant} — ${new Date().toISOString()}`
const html = `<p>This is a test send from the <strong>${tenant}</strong> tenant.</p><p>If you received this, the Gmail REST API path is working.</p>`

const raw = Buffer.from(
  [
    `From: ${ownerEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
  ].join('\r\n')
)
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '')

const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${tokenJson.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ raw }),
})

if (!sendRes.ok) {
  const detail = await sendRes.text()
  console.error(`✗ Gmail send failed (${sendRes.status}):`, detail)
  process.exit(1)
}

const sent = await sendRes.json()
console.log(`✓ Email sent — Gmail message ID: ${sent.id}`)
console.log(`\nCheck inbox at ${to}\n`)
