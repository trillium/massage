import { test, expect } from '@playwright/test'
import {
  ensureProvisioned,
  ensureNoOwner,
  ensureGoogleConnected,
  ensureGoogleDisconnected,
} from './helpers/tenantState'

test.describe('Tenant onboarding — Scene 1: deployment setup', () => {
  // Env-var config validation (uppercase slug, slug mismatch, management API token)
  // is covered by unit tests in app/api/health/__tests__/config-checks.test.ts

  test('GET /api/health returns ok when correctly configured', async ({ request }) => {
    const res = await request.get('/api/health')
    const body = await res.json()
    expect(body.checks.config.ok).toBe(true)
    expect(body.checks.config.warnings).toHaveLength(0)
  })
})

test.describe('Tenant onboarding — Scene 2: first boot / provisioning', () => {
  test.afterEach(async () => {
    await ensureProvisioned()
  })

  test('GET /api/health returns tenant: ready when schema and admin_emails are seeded', async ({
    request,
  }) => {
    await ensureProvisioned()
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.checks.provisioning.tenant).toBe('ready')
    expect(body.status).toBe('ok')
  })

  test('GET /api/health returns tenant: no_owner_seeded and 503 when admin_emails is empty', async ({
    request,
  }) => {
    await ensureNoOwner()
    const res = await request.get('/api/health')
    expect(res.status()).toBe(503)
    const body = await res.json()
    expect(body.checks.provisioning.tenant).toBe('no_owner_seeded')
    expect(body.status).toBe('degraded')
  })

  test.skip('GET /api/health returns tenant: unprovisioned and 503 when schema is missing', async () => {
    // SKIP: destructive — requires dropping the tenant schema. Run manually against a staging environment only.
  })
})

test.describe('Tenant onboarding — Scene 3: owner first login', () => {
  test('unauthenticated visit to /admin redirects to supabase-login with returnTo', async ({
    request,
  }) => {
    const res = await request.get('/admin', { maxRedirects: 0 })
    const location = res.headers()['location'] ?? ''
    expect(location).toContain('/auth/supabase-login')
    expect(location).toContain('redirectTo=%2Fadmin')
  })

  test('unauthenticated visit to /admin/schedule redirects with dynamic path preserved', async ({
    request,
  }) => {
    const res = await request.get('/admin/schedule', { maxRedirects: 0 })
    const location = res.headers()['location'] ?? ''
    expect(location).toContain('/auth/supabase-login')
    expect(location).toContain('redirectTo=%2Fadmin%2Fschedule')
  })

  test('Supabase callback with error param redirects to supabase-login with error', async ({
    request,
  }) => {
    const res = await request.get('/auth/callback/supabase?error=access_denied', {
      maxRedirects: 0,
    })
    expect(res.status()).toBe(302)
    const location = res.headers()['location'] ?? ''
    expect(location).toContain('/auth/supabase-login')
    expect(location).toContain('error=access_denied')
  })

  test('Supabase callback with no code redirects to /auth/supabase-login', async ({ request }) => {
    const res = await request.get('/auth/callback/supabase', { maxRedirects: 0 })
    expect(res.status()).toBe(302)
    const location = res.headers()['location'] ?? ''
    expect(location).toContain('/auth/supabase-login')
  })

  test.skip('Supabase callback with valid code and next=/admin lands at /admin', async () => {
    // SKIP: requires a real Supabase OAuth authorization code. Cannot be synthesized in a local test environment.
  })

  test.skip('auth service error shows Admin Access Required wall without redirecting', async () => {
    // SKIP: requires intercepting Supabase auth service to return an error. Use page.route() mock in a future iteration.
  })

  test.skip('authenticated non-admin user sees wall with privilege message', async () => {
    // SKIP: requires a provisioned non-admin user session. Add TEST_USER_EMAIL/PASSWORD + user storageState to unlock.
  })
})

test.describe('Tenant onboarding — Scene 4: Google not connected', () => {
  test.beforeEach(async () => {
    await ensureGoogleDisconnected()
  })

  test.afterEach(async () => {
    await ensureGoogleDisconnected()
  })

  test('visiting /admin with no Google credentials shows the not-connected banner', async ({
    page,
  }) => {
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText('Google Calendar is not connected.')).toBeVisible()
  })

  test('the not-connected banner link points to /admin/connect-google', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    const bannerLink = page.getByRole('link', { name: /Connect now/i })
    await expect(bannerLink).toBeVisible()
    await expect(bannerLink).toHaveAttribute('href', '/admin/connect-google')
  })

  test('visiting /admin with Google credentials present shows no banner', async ({ page }) => {
    await ensureGoogleConnected()
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText('Google Calendar is not connected.')).not.toBeVisible()
  })
})
