import { test, expect } from '@playwright/test'

test.describe('User Access - Authenticated', () => {
  test('authenticated user can access home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).not.toContain('/auth/supabase-login')
  })

  test('authenticated user cannot access admin panel', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })

    await page.waitForTimeout(1000)

    const currentUrl = page.url()
    console.log('[Test] Final URL after /admin navigation:', currentUrl)

    expect(currentUrl).not.toContain('/admin')
    expect(currentUrl).toBe('http://localhost:9999/')
  })

  test('user session persists across navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.goto('/about')
    await page.waitForLoadState('domcontentloaded')

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).not.toContain('/auth/supabase-login')
  })
})
