import { test as setup, expect } from '@playwright/test'

const adminFile = 'playwright/.auth/admin.json'
const userFile = 'playwright/.auth/user.json'

setup('authenticate as admin', async ({ page }) => {
  const testAdminEmail = process.env.TEST_ADMIN_EMAIL || 'trilliummassagela@gmail.com'
  const testAdminPassword = process.env.TEST_ADMIN_PASSWORD

  if (!testAdminPassword) {
    console.log('⚠️  Skipping admin auth setup - missing TEST_ADMIN_PASSWORD')
    return
  }

  page.on('console', (msg) => {
    if (msg.text().includes('[TestLogin]')) {
      console.log('Browser:', msg.text())
    }
  })

  page.on('pageerror', (err) => {
    console.error('Page error:', err.message)
  })

  await page.goto('http://localhost:9999/auth/_test-login')

  await page.getByLabel('Email').fill(testAdminEmail)
  await page.getByLabel('Password').fill(testAdminPassword)
  await page.getByRole('button', { name: /sign in/i }).click()

  await page.waitForURL((url) => !url.pathname.includes('/auth/_test-login'), {
    timeout: 10000,
    waitUntil: 'commit'
  })

  await page.waitForTimeout(2000)

  await page.goto('http://localhost:9999/admin', { waitUntil: 'commit' })

  expect(page.url()).toContain('/admin')

  await page.context().storageState({ path: adminFile })
})

setup('authenticate as user', async ({ page }) => {
  const testUserEmail = process.env.TEST_USER_EMAIL
  const testUserPassword = process.env.TEST_USER_PASSWORD

  if (!testUserEmail || !testUserPassword) {
    console.log('⚠️  Skipping user auth setup - missing TEST_USER_EMAIL or TEST_USER_PASSWORD')
    return
  }

  page.on('console', (msg) => {
    if (msg.text().includes('[TestLogin]')) {
      console.log('Browser:', msg.text())
    }
  })

  page.on('pageerror', (err) => {
    console.error('Page error:', err.message)
  })

  await page.goto('http://localhost:9999/auth/_test-login')

  await page.getByLabel('Email').fill(testUserEmail)
  await page.getByLabel('Password').fill(testUserPassword)
  await page.getByRole('button', { name: /sign in/i }).click()

  await page.waitForURL((url) => !url.pathname.includes('/auth/_test-login'), {
    timeout: 10000,
    waitUntil: 'commit'
  })

  await page.waitForTimeout(2000)

  expect(page.url()).not.toContain('/auth/_test-login')

  await page.context().storageState({ path: userFile })
})
