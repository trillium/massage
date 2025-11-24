import { test, expect } from '@playwright/test'

test.describe('Public Access - Unauthenticated', () => {
  test('unauthenticated user can access home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).toBe('http://localhost:9999/')
  })

  test('unauthenticated user redirected from admin', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')

    // Should be redirected to /auth/login with redirectedFrom parameter
    expect(page.url()).toContain('/auth/login')
    expect(page.url()).toContain('redirectedFrom=%2Fadmin')
    expect(page.url()).not.toContain('/admin')
  })

  test('unauthenticated user can access public pages', async ({ page }) => {
    const publicPages = ['/about', '/pricing', '/services']

    for (const path of publicPages) {
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')

      expect(page.url()).toContain(path)
    }
  })
})
