/**
 * Debug script: captures the exact redirect_to URL sent to Supabase during
 * the Google OAuth flow on /admin/connect-google.
 *
 * Run against the already-running dev server:
 *   npx playwright test tests/e2e/admin/debug-oauth-redirect.ts --project=public --headed
 *
 * The page uses isDev bypass so no admin auth session needed.
 * The test aborts the Supabase authorize request so no actual OAuth happens.
 */

import { test } from '@playwright/test'

test.use({ baseURL: 'http://localhost:9876' })

test('capture redirect_to sent to Supabase authorize', async ({ page }) => {
  let capturedAuthorizeUrl: string | null = null

  await page.route('**/auth/v1/authorize**', (route) => {
    capturedAuthorizeUrl = route.request().url()
    route.abort()
  })

  await page.goto('/admin/connect-google', { waitUntil: 'networkidle' })

  const connectButton = page.getByRole('button', { name: /connect google/i })
  await connectButton.waitFor({ state: 'visible', timeout: 5000 })
  await connectButton.click()

  await page.waitForTimeout(1000)

  if (capturedAuthorizeUrl) {
    const url = new URL(capturedAuthorizeUrl)
    console.log('\n=== Supabase authorize URL ===')
    console.log('Full URL:', capturedAuthorizeUrl)
    console.log('\nredirect_to param:', url.searchParams.get('redirect_to'))
    console.log('provider:', url.searchParams.get('provider'))
    console.log('==============================\n')
  } else {
    console.log('\n⚠️  No authorize request captured — button click may not have fired OAuth\n')
  }
})
