// Stories captured from docs/MULTI_TENANT_ONBOARDING.md — run against staging when a
// provisioned test tenant is available.

import { test, expect } from '@playwright/test'

test.describe('Tenant onboarding — Scene 1: deployment setup', () => {
  test.skip('TENANT_SLUG with uppercase or spaces degrades health and surfaces a warning', async ({
    request,
  }) => {
    // Requires a deployment where TENANT_SLUG is misconfigured (e.g. "Sarah_Music").
    const res = await request.get('/api/health')
    expect(res.status()).toBe(503)
    const body = await res.json()
    expect(body.status).toBe('degraded')
    expect(body.checks.config.ok).toBe(false)
    expect(body.checks.config.warnings).toEqual(
      expect.arrayContaining([expect.stringMatching(/uppercase or spaces/)])
    )
  })

  test.skip('TENANT_SLUG ≠ NEXT_PUBLIC_TENANT_SLUG degrades health and surfaces a mismatch warning', async ({
    request,
  }) => {
    // Requires a deployment where the two slug env vars diverge.
    const res = await request.get('/api/health')
    expect(res.status()).toBe(503)
    const body = await res.json()
    expect(body.status).toBe('degraded')
    expect(body.checks.config.ok).toBe(false)
    expect(body.checks.config.warnings).toEqual(
      expect.arrayContaining([expect.stringMatching(/do not match/)])
    )
  })

  test.skip('SUPABASE_MANAGEMENT_API_TOKEN present is reported in /api/health checks', async ({
    request,
  }) => {
    // Requires a deployment with SUPABASE_MANAGEMENT_API_TOKEN set.
    const res = await request.get('/api/health')
    const body = await res.json()
    expect(body.checks.management_api.ok).toBe(true)
  })

  test.skip('SUPABASE_MANAGEMENT_API_TOKEN absent is reported with a detail message', async ({
    request,
  }) => {
    // Requires a deployment without SUPABASE_MANAGEMENT_API_TOKEN (redirect URLs need manual registration).
    const res = await request.get('/api/health')
    const body = await res.json()
    expect(body.checks.management_api.ok).toBe(false)
    expect(body.checks.management_api.detail).toMatch(/manually/)
  })
})

test.describe('Tenant onboarding — Scene 2: first boot / provisioning', () => {
  test.skip('GET /api/health returns tenant: ready when schema and admin_emails are seeded', async ({
    request,
  }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.tenant).toBe('ready')
    expect(body.status).toBe('ok')
  })

  test.skip('GET /api/health returns tenant: no_owner_seeded and 503 when admin_emails is empty', async ({
    request,
  }) => {
    // Requires a provisioned schema with an empty admin_emails table.
    const res = await request.get('/api/health')
    expect(res.status()).toBe(503)
    const body = await res.json()
    expect(body.tenant).toBe('no_owner_seeded')
    expect(body.status).toBe('degraded')
  })

  test.skip('GET /api/health returns tenant: unprovisioned and 503 when schema is missing', async ({
    request,
  }) => {
    // Requires a deployment where the tenant schema has never been provisioned.
    const res = await request.get('/api/health')
    expect(res.status()).toBe(503)
    const body = await res.json()
    expect(body.tenant).toBe('unprovisioned')
    expect(body.status).toBe('degraded')
  })
})

test.describe('Tenant onboarding — Scene 3: owner first login', () => {
  test.skip('unauthenticated visit to /admin redirects to supabase-login with returnTo', async ({
    page,
  }) => {
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).toContain('/auth/supabase-login')
    expect(page.url()).toContain('redirectTo=%2Fadmin')
  })

  test.skip('unauthenticated visit to /admin/schedule redirects with dynamic path preserved', async ({
    page,
  }) => {
    await page.goto('/admin/schedule')
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).toContain('/auth/supabase-login')
    expect(page.url()).toContain('redirectTo=%2Fadmin%2Fschedule')
  })

  test.skip('auth service error shows Admin Access Required wall without redirecting', async ({
    page,
  }) => {
    // Requires a mock or intercepted Supabase auth service that returns an error.
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByRole('heading', { name: 'Admin Access Required' })).toBeVisible()
    expect(page.url()).not.toContain('/auth/supabase-login')
  })

  test.skip('authenticated non-admin user sees wall with privilege message', async ({ page }) => {
    // Requires a logged-in session for a user with role != "admin".
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.getByText('Admin access required. Your account does not have admin privileges.')
    ).toBeVisible()
  })

  test.skip('Supabase callback with valid code and next=/admin lands at /admin', async ({
    page,
  }) => {
    // Requires a real or mocked Supabase code exchange flow.
    // The callback route exchanges the code for a session then redirects to `next`.
    await page.goto('/auth/callback/supabase?code=valid_code&next=%2Fadmin')
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).toContain('/admin')
  })

  test.skip('Supabase callback with error param redirects to supabase-login with error', async ({
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

  test.skip('Supabase callback with no code redirects to /auth/supabase-login', async ({
    request,
  }) => {
    const res = await request.get('/auth/callback/supabase', { maxRedirects: 0 })
    expect(res.status()).toBe(302)
    const location = res.headers()['location'] ?? ''
    expect(location).toContain('/auth/supabase-login')
  })
})

test.describe('Tenant onboarding — Scene 4: Google not connected', () => {
  test.skip('visiting /admin with no Google credentials shows the not-connected banner', async ({
    page,
  }) => {
    // Requires an admin session on a tenant with no google_credentials rows.
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText('Google Calendar is not connected.')).toBeVisible()
  })

  test.skip('the not-connected banner link points to /admin/connect-google', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    const bannerLink = page.getByRole('link', { name: /Connect now/i })
    await expect(bannerLink).toBeVisible()
    await expect(bannerLink).toHaveAttribute('href', '/admin/connect-google')
  })

  test.skip('visiting /admin with Google credentials present shows no not-connected banner', async ({
    page,
  }) => {
    // Requires an admin session on a tenant with at least one google_credentials row.
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText('Google Calendar is not connected.')).not.toBeVisible()
  })
})
