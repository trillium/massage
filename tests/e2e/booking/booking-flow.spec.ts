import { test, expect } from '@playwright/test'

test.describe('Booking Flow - End to End', () => {
  test('complete booking flow from date selection to confirmation', async ({ page }) => {
    await page.route('https://www.googleapis.com/calendar/v3/freeBusy', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          calendars: {
            primary: {
              busy: [],
            },
          },
        }),
      })
    })

    await page.goto('/book')
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).toContain('/book')

    await page.waitForSelector('[role="grid"]', { timeout: 10000 })

    const availableDateLabel = page
      .locator('label[for^="day-"]')
      .filter({ has: page.locator('input:not([disabled])') })
      .first()
    await availableDateLabel.click()

    await page.waitForSelector('button[type="button"]:has-text("–")', { timeout: 5000 })

    const timeSlot = page.locator('button[type="button"]:has-text("–")').first()
    await timeSlot.click()

    await page.waitForSelector('form', { timeout: 5000 })

    await page.fill('#firstName', 'Test')
    await page.fill('#lastName', 'User')
    await page.fill('#phone', '555-123-4567')
    await page.fill('#location', '123 Test Street')
    await page.fill('#city', 'Los Angeles')
    await page.fill('#zipCode', '90001')
    await page.fill('#email', 'test@example.com')

    const cashPaymentRadio = page.locator('#cash')
    await cashPaymentRadio.click()

    await page.route('**/api/request', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          bookingId: 'test-booking-123',
          confirmationNumber: 'CONF-12345',
        }),
      })
    })

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    await page.waitForURL('**/confirmation**', { timeout: 10000 })
    expect(page.url()).toContain('confirmation')
  })

  test('booking form validation - empty required fields', async ({ page }) => {
    await page.route('https://www.googleapis.com/calendar/v3/freeBusy', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          calendars: {
            primary: {
              busy: [],
            },
          },
        }),
      })
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

    const timeSlot = page.locator('button[type="button"]:has-text("–")').first()
    await timeSlot.click()

    await page.waitForSelector('form', { timeout: 5000 })

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    await page.waitForTimeout(200)

    const firstNameField = page.locator('#firstName')
    const validationMessage = await firstNameField.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    )

    expect(validationMessage).toBeTruthy()
  })

  test('booking form validation - invalid email', async ({ page }) => {
    await page.route('https://www.googleapis.com/calendar/v3/freeBusy', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          calendars: {
            primary: {
              busy: [],
            },
          },
        }),
      })
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

    const timeSlot = page.locator('button[type="button"]:has-text("–")').first()
    await timeSlot.click()

    await page.waitForSelector('form', { timeout: 5000 })

    await page.fill('#firstName', 'Test')
    await page.fill('#lastName', 'User')
    await page.fill('#phone', '555-123-4567')
    await page.fill('#location', '123 Test Street')
    await page.fill('#city', 'Los Angeles')
    await page.fill('#zipCode', '90001')
    await page.fill('#email', 'invalid-email')

    const cashPaymentRadio = page.locator('#cash')
    await cashPaymentRadio.click()

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    await page.waitForTimeout(200)

    const emailField = page.locator('#email')
    const validationMessage = await emailField.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    )

    expect(validationMessage).toBeTruthy()
  })
})
