import { test, expect } from '@playwright/test'

test.describe('Admin Chip Visibility - Non-Admin User', () => {
  test('non-admin user logged in - chip NOT visible on home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const adminChip = page.locator('text=✓ Admin')
    await expect(adminChip).not.toBeVisible()
  })

  test('non-admin user logged in - chip NOT visible on about page', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('domcontentloaded')

    const adminChip = page.locator('text=✓ Admin')
    await expect(adminChip).not.toBeVisible()
  })

  test('non-admin user logged in - chip NOT visible on pricing page', async ({ page }) => {
    await page.goto('/pricing')
    await page.waitForLoadState('domcontentloaded')

    const adminChip = page.locator('text=✓ Admin')
    await expect(adminChip).not.toBeVisible()
  })
})
