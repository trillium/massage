import { test, expect } from '@playwright/test'
import { setupAdminSession } from './helpers/auth'

test.describe('Admin Access - Authenticated', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('authenticated admin user can access admin dashboard', async ({ page }) => {
    await setupAdminSession(page)

    await page.goto('/admin')

    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/admin')
    expect(page.url()).not.toContain('/auth/supabase-login')

    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 5000 })
  })

  test('authenticated admin can access admin subpages', async ({ page }) => {
    await setupAdminSession(page)

    const adminPages = [
      { path: '/admin', expectedText: 'Admin' },
      { path: '/admin/users', expectedText: '' },
      { path: '/admin/configuration', expectedText: '' },
    ]

    for (const { path } of adminPages) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      expect(page.url()).toContain(path)
      expect(page.url()).not.toContain('/auth/supabase-login')
    }
  })

  test('admin session persists across page navigation', async ({ page }) => {
    await setupAdminSession(page)

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin')

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/admin')
    expect(page.url()).not.toContain('/auth/supabase-login')
  })
})
