import { describe, it, expect } from 'vitest'
import { createBookingFormSchema } from '@/lib/bookingFormSchema'

describe('createBookingFormSchema phone-or-telegram contact requirement (allowTelegramContact: true)', () => {
  const schema = createBookingFormSchema({ allowTelegramContact: true })

  const baseFormValues = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    location: { street: '123 Main St', city: 'San Francisco', zip: '94110' },
    paymentMethod: 'cash' as const,
    start: '2025-06-15T10:00:00-07:00',
    end: '2025-06-15T11:30:00-07:00',
    duration: 90,
    timeZone: 'America/Los_Angeles',
    eventBaseString: '__EVENT__',
  }

  it('accepts submission with only phone', () => {
    const result = schema.safeParse({ ...baseFormValues, phone: '555-123-4567' })
    expect(result.success).toBe(true)
  })

  it('accepts submission with only telegramHandle', () => {
    const result = schema.safeParse({ ...baseFormValues, telegramHandle: '@janedoe' })
    expect(result.success).toBe(true)
  })

  it('accepts submission with both phone and telegramHandle', () => {
    const result = schema.safeParse({
      ...baseFormValues,
      phone: '555-123-4567',
      telegramHandle: '@janedoe',
    })
    expect(result.success).toBe(true)
  })

  it('rejects submission with neither phone nor telegramHandle', () => {
    const result = schema.safeParse(baseFormValues)
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Either phone or telegram handle must be provided.')
    }
  })

  it('rejects submission with empty-string phone and telegramHandle', () => {
    const result = schema.safeParse({ ...baseFormValues, phone: '', telegramHandle: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid phone format even when telegram is empty', () => {
    const result = schema.safeParse({ ...baseFormValues, phone: 'abc', telegramHandle: '' })
    expect(result.success).toBe(false)
  })

  it('accepts an invalid phone format when telegramHandle satisfies the contact rule', () => {
    const result = schema.safeParse({ ...baseFormValues, phone: '', telegramHandle: '@valid' })
    expect(result.success).toBe(true)
  })
})

describe('createBookingFormSchema default (phone required)', () => {
  const schema = createBookingFormSchema()

  const baseFormValues = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    location: { street: '123 Main St', city: 'San Francisco', zip: '94110' },
    paymentMethod: 'cash' as const,
    start: '2025-06-15T10:00:00-07:00',
    end: '2025-06-15T11:30:00-07:00',
    duration: 90,
    timeZone: 'America/Los_Angeles',
    eventBaseString: '__EVENT__',
  }

  it('accepts a valid phone with no telegram', () => {
    const result = schema.safeParse({ ...baseFormValues, phone: '555-123-4567' })
    expect(result.success).toBe(true)
  })

  it('rejects telegram-only submission', () => {
    const result = schema.safeParse({ ...baseFormValues, telegramHandle: '@janedoe' })
    expect(result.success).toBe(false)
  })

  it('rejects empty phone', () => {
    const result = schema.safeParse({ ...baseFormValues, phone: '' })
    expect(result.success).toBe(false)
  })
})
