import { test, expect } from '@playwright/test'

test.describe('Admin Route Protection', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('unauthenticated user cannot access admin dashboard', async ({ page }) => {
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    expect(page.url()).toContain('redirectedFrom=%2Fadmin')
  })

  test('unauthenticated user redirected from admin subpages', async ({ page }) => {
    const adminPages = ['/admin/users', '/admin/settings', '/admin/configuration']

    for (const adminPage of adminPages) {
      await page.goto(adminPage)
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    }
  })

  test('unauthenticated user sees login URL when accessing admin', async ({ page }) => {
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })

    expect(page.url()).toContain('redirectedFrom')
  })
})
