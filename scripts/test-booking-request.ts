#!/usr/bin/env tsx
/**
 * Submit a test appointment request to /api/request on any environment.
 * Loads fixture from scripts/test-fixtures/booking-test.json.
 * Queries /api/health/:slug first to get the next available slot.
 *
 * Usage:
 *   bun scripts/test-booking-request.ts                          # → localhost:9876
 *   bun scripts/test-booking-request.ts https://trilliummassage.la
 *   bun scripts/test-booking-request.ts https://test.trilliummassage.la
 */

import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

config({ path: '.env.local' })

const baseUrl = process.argv[2]?.replace(/\/$/, '') || 'http://localhost:9876'

const fixture = JSON.parse(
  readFileSync(join(import.meta.dir, 'test-fixtures/booking-test.json'), 'utf8')
)

const duration = Number(fixture.duration || '60')
const slug = fixture.eventBaseString || 'overdrive-appreciation'

// Step 1: find the first available slot
console.log(`\nFetching first available slot for "${slug}" (${duration} min)...`)
const healthRes = await fetch(`${baseUrl}/api/health/${slug}`)
const health = await healthRes.json()

if (!health.ok || !health.next_available) {
  console.error(`✗ No available slots for "${slug}"`)
  console.error(JSON.stringify(health, null, 2))
  process.exit(1)
}

const start = health.next_available
const end = new Date(new Date(start).getTime() + duration * 60_000).toISOString()
console.log(`  Next available: ${start}`)
console.log(`  End:            ${end}\n`)

// Step 2: submit the booking
const payload = { ...fixture, start, end, duration: String(duration) }

console.log(`Target: ${baseUrl}/api/request`)
console.log(`Email:  ${fixture.email}`)
console.log(`Phone:  ${fixture.phone}\n`)

const res = await fetch(`${baseUrl}/api/request`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})

const body = await res.json().catch(() => null)

if (res.ok) {
  console.log(`✓ ${res.status} — request accepted`)
  console.log(JSON.stringify(body, null, 2))
} else {
  console.error(`✗ ${res.status} — request failed`)
  console.error(JSON.stringify(body, null, 2))
  process.exit(1)
}
