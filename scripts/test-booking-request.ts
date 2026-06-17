#!/usr/bin/env tsx
/**
 * Submit a test appointment request to /api/request on any environment.
 *
 * Usage:
 *   bun scripts/test-booking-request.ts                          # → localhost:9876
 *   bun scripts/test-booking-request.ts https://trilliummassage.la
 *   bun scripts/test-booking-request.ts https://test.trilliummassage.la
 *
 * Optional env overrides:
 *   TEST_EMAIL=you@example.com   (who the booking appears to come from)
 *   TEST_DATE=2026-06-20         (YYYY-MM-DD, defaults to tomorrow)
 *   TEST_DURATION=90             (minutes, defaults to 60)
 *   TEST_SLUG=overdrive-appreciation
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

const baseUrl = process.argv[2]?.replace(/\/$/, '') || 'http://localhost:9876'

const testEmail = process.env.TEST_EMAIL || 'test+booking@example.com'
const duration = Number(process.env.TEST_DURATION || '60')
const slug = process.env.TEST_SLUG || 'overdrive-appreciation'

// Build start/end: tomorrow at 11am local, duration minutes long
const rawDate = process.env.TEST_DATE
const base = rawDate
  ? new Date(`${rawDate}T11:00:00`)
  : (() => {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      d.setHours(11, 0, 0, 0)
      return d
    })()

const start = base.toISOString()
const end = new Date(base.getTime() + duration * 60_000).toISOString()

const payload = {
  firstName: 'Test',
  lastName: 'Booking',
  email: testEmail,
  phone: '3105550123',
  start,
  end,
  duration: String(duration),
  timeZone: 'America/Los_Angeles',
  locationString: '123 Test St, Los Angeles CA 90001',
  eventBaseString: slug,
  bookingUrl: `/${slug}`,
  slugConfiguration: { slug, blockingScope: 'slug' },
}

console.log(`\nTarget:   ${baseUrl}/api/request`)
console.log(`Slug:     ${slug}`)
console.log(`Duration: ${duration} min`)
console.log(`Start:    ${start}`)
console.log(`End:      ${end}`)
console.log(`Email:    ${testEmail}\n`)

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
