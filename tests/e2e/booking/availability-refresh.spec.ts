import { test, expect } from '@playwright/test'

test.describe('Booking Availability Auto-Refresh', () => {
  test('slots update when availability changes after tab refocus', async ({ page }) => {
    let requestCount = 0

    await page.route('https://www.googleapis.com/calendar/v3/freeBusy', async (route) => {
      requestCount++
      const body = JSON.parse(route.request().postData() || '{}')
      const timeMin = body.timeMin || ''

      if (requestCount <= 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            calendars: { primary: { busy: [] } },
          }),
        })
      } else {
        const date = timeMin.split('T')[0]
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            calendars: {
              primary: {
                busy: [
                  { start: `${date}T09:00:00Z`, end: `${date}T12:00:00Z` },
                  { start: `${date}T13:00:00Z`, end: `${date}T17:00:00Z` },
                ],
              },
            },
          }),
        })
      }
    })

    await page.goto('/book')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('[role="grid"]', { timeout: 10000 })

    const availableDateLabel = page
      .locator('label[for^="day-"]')
      .filter({ has: page.locator('input:not([disabled])') })
      .first()
    await availableDateLabel.click()

    await page.waitForSelector('button[type="button"]:has-text("–")', { timeout: 5000 })
    const initialSlotCount = await page.locator('button[type="button"]:has-text("–")').count()
    expect(initialSlotCount).toBeGreaterThan(0)

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true,
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true,
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await page.waitForTimeout(2000)

    const updatedSlotCount = await page.locator('button[type="button"]:has-text("–")').count()
    expect(updatedSlotCount).toBeLessThan(initialSlotCount)
  })
})
