import { test, expect } from '@playwright/test'
import {
  createTenantSchema,
  dropTenantSchema,
  seedAdminEmail,
  createTestUser,
} from './helpers/tenantState'

const E2E_SLUG = 'e2e_test_tenant'
const adminEmail = process.env.TEST_ADMIN_EMAIL || 'trillium@trilliumsmith.com'
const adminPassword = process.env.TEST_ADMIN_PASSWORD
const storageStatePath = 'playwright/.auth/e2e-live-admin.json'

test.describe.configure({ mode: 'serial' })

test.describe('Live onboarding — Scene A: Tenant Provisioning', () => {
  test('create_tenant RPC provisions schema and tables', async ({ request }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/create_tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        p_tenant_slug: E2E_SLUG,
      }),
    })

    expect(res.ok).toBe(true)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.tenant_slug).toBe(E2E_SLUG)
  })

  test('seed admin email for test owner', async () => {
    await seedAdminEmail(E2E_SLUG, adminEmail)
  })

  test('health endpoint reports tenant ready', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.checks.provisioning.tenant).toBe('ready')
  })
})

test.describe('Live onboarding — Scene B: Owner Signup + Admin Access', () => {
  test.skip(!adminPassword, 'TEST_ADMIN_PASSWORD not set')

  test('create test user and sign in via test-login', async ({ page }) => {
    await createTestUser(adminEmail, adminPassword!)

    page.on('console', (msg) => {
      if (msg.text().includes('[TestLogin]')) {
        console.log('Browser:', msg.text())
      }
    })

    await page.goto('/auth/test-login')
    await page.getByLabel('Email').fill(adminEmail)
    await page.getByLabel('Password').fill(adminPassword!)
    await page.getByRole('button', { name: /sign in/i }).click()

    await page.waitForURL((url) => !url.pathname.includes('/auth/test-login'), {
      timeout: 10000,
      waitUntil: 'commit',
    })

    await page.waitForTimeout(2000)
    await page.goto('/admin', { waitUntil: 'commit' })
    expect(page.url()).toContain('/admin')

    await page.context().storageState({ path: storageStatePath })
  })
})

test.describe('Live onboarding — Scene C: Google OAuth Connect', () => {
  test.skip(!adminPassword, 'TEST_ADMIN_PASSWORD not set')

  test.use({ storageState: storageStatePath })

  test('connect-google page loads and shows connect button', async ({ page }) => {
    await page.goto('/admin/connect-google')
    await page.waitForLoadState('domcontentloaded')

    const connectButton = page
      .getByRole('link', { name: /connect google/i })
      .or(page.getByRole('button', { name: /connect google/i }))
    await expect(connectButton).toBeVisible({ timeout: 5000 })
  })

  test('manual OAuth flow (headed mode with pause)', async ({ page }) => {
    test.skip(!process.env.HEADED_OAUTH, 'Set HEADED_OAUTH=1 and run --headed for manual OAuth')

    await page.goto('/admin/connect-google')
    await page.waitForLoadState('domcontentloaded')

    const connectButton = page
      .getByRole('link', { name: /connect google/i })
      .or(page.getByRole('button', { name: /connect google/i }))
    await connectButton.click()

    await page.pause()

    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText('Google Calendar is not connected.')).not.toBeVisible()
  })
})

test.describe('Live onboarding — Scene D: Calendar Availability', () => {
  test('booking page shows calendar grid with available dates', async ({ page }) => {
    await page.goto('/book')
    await page.waitForLoadState('domcontentloaded')

    const calendarGrid = page
      .locator('[data-testid="calendar-grid"]')
      .or(page.locator('.calendar-grid'))
      .or(page.locator('[role="grid"]'))

    await expect(calendarGrid).toBeVisible({ timeout: 10000 })

    const availableDay = page
      .locator('button:not([disabled])')
      .filter({
        has: page.locator('[data-available="true"]'),
      })
      .or(page.locator('[data-testid="available-day"]'))
      .or(page.locator('.calendar-day:not(.unavailable):not(.past)'))

    const dayCount = await availableDay.count()
    if (dayCount > 0) {
      await availableDay.first().click()

      const timeSlots = page
        .locator('[data-testid="time-slots"]')
        .or(page.locator('.time-slots'))
        .or(page.getByRole('listbox'))
        .or(page.locator('[data-testid="time-slot"]').first())
      await expect(timeSlots).toBeVisible({ timeout: 10000 })
    } else {
      console.log('No available days found on calendar — Google Calendar may have no openings')
    }
  })
})

test.describe('Live onboarding — Scene E: Contact Form Email', () => {
  test('POST /api/contact returns success', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: {
        name: 'E2E Test User',
        email: adminEmail,
        message: 'Automated e2e onboarding test — please ignore',
      },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.error).toBeUndefined()
  })
})

test.afterAll(async () => {
  if (process.env.SKIP_TEARDOWN) {
    console.log(`SKIP_TEARDOWN set — preserving schema '${E2E_SLUG}' for debugging`)
    return
  }

  try {
    await dropTenantSchema(E2E_SLUG)
    console.log(`Dropped schema '${E2E_SLUG}'`)
  } catch (err) {
    console.warn(`Teardown failed:`, err)
  }
})
