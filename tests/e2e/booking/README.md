# Booking Flow E2E Tests

## Overview

These tests verify the complete booking flow from date/time selection through form submission to confirmation.

## Test Structure

### Main Test: `complete booking flow from date selection to confirmation`

**Steps:**
1. Navigate to `/book`
2. Select duration (if applicable)
3. Click next available date in calendar
4. Click next available time slot
5. Fill out customer information (name, email, phone)
6. Fill out location fields (address, city, state, zip)
7. Select payment type
8. Mock API responses
9. Submit form
10. Verify redirect to confirmation page

### Validation Tests

- **Empty required fields**: Verifies form validation prevents submission
- **Invalid email**: Verifies email format validation

## Customizing for Your App

The test uses multiple selector strategies to be flexible. You'll need to update selectors based on your actual HTML structure.

### Finding the Right Selectors

1. **Run the app**: `pnpm dev`
2. **Open the booking page**: http://localhost:9876/book
3. **Open Chrome DevTools** (F12)
4. **Inspect elements** and note:
   - `data-testid` attributes (preferred)
   - Class names
   - Input `name` attributes
   - Button text

### Common Selectors to Update

#### Duration Picker
```typescript
// Current (generic):
const durationButton = page.locator('[data-testid="duration-picker"]').first()

// Update to match your actual selector:
const durationButton = page.locator('[data-testid="duration-60"]') // Example
```

#### Calendar Day
```typescript
// Current (tries multiple selectors):
const availableDate = page.locator(
  '[data-testid="calendar-day"]:not([aria-disabled="true"])'
).first()

// Update based on your calendar implementation
```

#### Time Slots
```typescript
// Current:
const timeSlot = page.locator('[data-testid="time-slot"]:not(:disabled)').first()

// Update to match your time slot buttons
```

#### Form Fields

Check your `BookingForm` component and update these:

```typescript
// Name fields
await page.fill('[name="firstName"]', 'Test')
await page.fill('[name="lastName"]', 'User')

// Email
await page.fill('[name="email"]', 'test@example.com')

// Location
await page.fill('[name="address"]', '123 Test Street')
await page.fill('[name="city"]', 'Los Angeles')
await page.fill('[name="zip"]', '90001')

// Payment type (radio or select)
await page.locator('[name="paymentType"][value="cash"]').click()
```

### API Mocking

The test mocks two API endpoints:

#### Booking Submission
```typescript
await page.route('**/api/booking', async (route) => {
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
```

**Update the route pattern** to match your actual booking API endpoint.

#### Calendar API
```typescript
await page.route('**/api/calendar/**', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true }),
  })
})
```

**Update if your app calls** Google Calendar or external booking APIs.

### Confirmation Page

Update the confirmation page verification:

```typescript
// Current (generic):
await page.waitForURL('**/confirmation**', { timeout: 10000 })

// Update to your actual confirmation route:
await page.waitForURL('**/booking/confirmation/**', { timeout: 10000 })
// or
await page.waitForURL(/\/booking\/[a-z0-9-]+\/confirm/, { timeout: 10000 })
```

## Running the Tests

### Run all booking tests:
```bash
pnpm test:e2e tests/e2e/booking
```

### Run specific test:
```bash
pnpm test:e2e tests/e2e/booking/booking-flow.spec.ts
```

### Run with UI (helpful for debugging):
```bash
pnpm test:e2e:ui tests/e2e/booking
```

### Run in headed mode (see the browser):
```bash
pnpm test:e2e:headed tests/e2e/booking
```

## Debugging Tips

### 1. Add console logs
```typescript
console.log('[Debug] Current URL:', await page.url())
console.log('[Debug] Form values:', await page.locator('form').evaluate(form => {
  return new FormData(form as HTMLFormElement)
}))
```

### 2. Take screenshots
```typescript
await page.screenshot({ path: 'debug-calendar.png' })
```

### 3. Add pauses
```typescript
await page.pause() // Opens Playwright Inspector
```

### 4. Check what's visible
```typescript
const visible = await page.locator('[data-testid="time-slot"]').count()
console.log('Visible time slots:', visible)
```

## Test Data

### Valid Test Data
- Name: `Test User`
- Email: `test@example.com`
- Phone: `555-123-4567`
- Address: `123 Test Street`
- City: `Los Angeles`
- State: `CA`
- Zip: `90001`
- Payment: `cash`

### Invalid Test Data
- Invalid email: `invalid-email`
- Empty required fields: (leave blank)

## Expected Behavior

### Success Flow
1. ✅ Calendar loads with available dates
2. ✅ Time slots load after date selection
3. ✅ Form accepts valid input
4. ✅ API call is mocked (no real booking created)
5. ✅ Redirect to confirmation page
6. ✅ Confirmation message displayed

### Validation Flow
1. ✅ Empty form shows validation errors
2. ✅ Invalid email shows error
3. ✅ Submit button disabled until valid

## Next Steps

1. **Inspect your booking form** using browser DevTools
2. **Update selectors** in `booking-flow.spec.ts` to match your actual HTML
3. **Update API route patterns** to match your endpoints
4. **Update confirmation URL pattern** to match your routing
5. **Run the test** and iterate based on failures
6. **Add more test cases** (e.g., different payment methods, edge cases)

## Additional Test Ideas

- Multiple booking types (different massage types/durations)
- Back button behavior (return to form from confirmation)
- Form field persistence (if user navigates away and back)
- Mobile responsive behavior
- Accessibility (keyboard navigation, screen reader labels)
- Error handling (API failures, network errors)
