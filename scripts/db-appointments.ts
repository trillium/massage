#!/usr/bin/env tsx
/**
 * Query live appointments directly from Supabase tenant schema.
 *
 * Usage:
 *   pnpm db:appointments                      # last 20 across all slugs
 *   pnpm db:appointments --slug nerdstage     # filter by booking_url
 *   pnpm db:appointments --slug nerdstage --limit 5
 *   pnpm db:appointments --status confirmed
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const tenant = process.env.TENANT_SLUG || 'public'

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const args = process.argv.slice(2)
function flag(name: string): string | undefined {
  const i = args.indexOf(`--${name}`)
  return i !== -1 ? args[i + 1] : undefined
}

const slugArg = flag('slug')
const statusArg = flag('status')
const limitArg = parseInt(flag('limit') ?? '20', 10)

const client = createClient(url, key, { db: { schema: tenant as 'public' } })

let query = client
  .from('appointments')
  .select(
    'id, status, instant_confirm, booking_url, start_time, created_at, client_first_name, client_last_name'
  )
  .order('created_at', { ascending: false })
  .limit(limitArg)

if (slugArg) {
  const slugPath = slugArg.startsWith('/') ? slugArg : `/${slugArg}`
  query = query.or(`booking_url.eq.${slugPath},booking_url.eq.${slugArg}`) as typeof query
}

if (statusArg) {
  query = query.eq('status', statusArg) as typeof query
}

const { data, error } = await query

if (error) {
  console.error(`\nQuery failed: ${error.message}`)
  console.error(`Schema: ${tenant}`)
  process.exit(1)
}

const rows = data ?? []

console.log(
  `\nAppointments — schema: ${tenant}${slugArg ? ` | slug: ${slugArg}` : ''}${statusArg ? ` | status: ${statusArg}` : ''}`
)
console.log(`Total: ${rows.length}\n`)

if (rows.length === 0) {
  console.log('  (no rows found)')
} else {
  for (const r of rows) {
    const name = `${r.client_first_name} ${r.client_last_name}`
    const start = new Date(r.start_time).toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
    })
    const created = new Date(r.created_at).toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
    })
    const ic = r.instant_confirm ? ' [instant]' : ''
    console.log(
      `  ${r.status.padEnd(10)} ${r.booking_url?.padEnd(30) ?? '(no slug)'.padEnd(30)} ${name.padEnd(24)} start: ${start}  booked: ${created}${ic}`
    )
  }
}

console.log()
