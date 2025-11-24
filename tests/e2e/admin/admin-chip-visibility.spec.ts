import { test, expect } from '@playwright/test'

test.describe('Admin Chip Visibility on Non-Admin Routes', () => {
  test('admin logged in - chip visible on home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const adminChip = page.locator('text=✓ Admin')
    await expect(adminChip).toBeVisible({ timeout: 5000 })
  })

  test('admin logged in - chip visible on about page', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('domcontentloaded')

    const adminChip = page.locator('text=✓ Admin')
    await expect(adminChip).toBeVisible({ timeout: 5000 })
  })

  test('admin logged in - chip visible on pricing page', async ({ page }) => {
    await page.goto('/pricing')
    await page.waitForLoadState('domcontentloaded')

    const adminChip = page.locator('text=✓ Admin')
    await expect(adminChip).toBeVisible({ timeout: 5000 })
  })
})
