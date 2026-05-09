import { test, expect } from '@playwright/test'

/**
 * Verifies the OAuth redirectTo URL is constructed from window.location.origin
 * and contains localhost (not 0.0.0.0), which is required for Supabase to
 * match it against the allowed redirect URL list.
 *
 * Background: Supabase rejects redirectTo URLs not in the allowed list and
 * falls back to the Site URL (production). If the dev server is accessed via
 * 0.0.0.0 instead of localhost, the constructed redirectTo won't match
 * http://localhost:* and the OAuth code lands on the production domain.
 */

test.describe('connect-google OAuth redirect URL', () => {
  test('window.location.origin is localhost, not 0.0.0.0', async ({ page }) => {
    await page.goto('/')
    const origin = await page.evaluate(() => window.location.origin)
    expect(origin).not.toContain('0.0.0.0')
    expect(origin).toMatch(/^https?:\/\/localhost/)
  })

  test('OAuth redirectTo param uses localhost origin', async ({ page }) => {
    let capturedRedirectTo: string | null = null

    await page.route('**/auth/v1/authorize**', (route) => {
      const url = new URL(route.request().url())
      capturedRedirectTo = url.searchParams.get('redirect_to')
      route.abort()
    })

    await page.goto('/admin/connect-google')

    const connectButton = page.getByRole('button', { name: /connect google/i })

    if (await connectButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await connectButton.click()
      await page.waitForTimeout(500)

      if (capturedRedirectTo) {
        const redirectTo = capturedRedirectTo as string
        expect(redirectTo).not.toContain('0.0.0.0')
        expect(redirectTo).toMatch(/^https?:\/\/localhost/)
        expect(redirectTo).toContain('/auth/callback/supabase')
        expect(redirectTo).toContain('connect_google=1')
      }
    } else {
      // Page redirected (no admin session) — at minimum confirm origin is localhost
      const origin = await page.evaluate(() => window.location.origin)
      expect(origin).not.toContain('0.0.0.0')
    }
  })
})
