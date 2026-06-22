import { describe, it, expect } from 'vitest'
import { AppointmentRequestSchema } from '../../../../lib/schema'

// This is a sample valid payload. Adjust as needed for your app.
const validPayload = {
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  start: new Date().toISOString(),
  end: new Date(Date.now() + 3600000).toISOString(),
  timeZone: 'America/Los_Angeles',
  locationObject: {
    street: '123 Main St',
    city: 'New York',
    zip: '10001',
  },
  duration: '60',
  price: '100',
  phone: '555-1234',
  eventBaseString: 'base',
  paymentMethod: 'cash', // or any valid value from paymentMethodValues
}

describe('AppointmentRequestSchema', () => {
  it('accepts a valid payload', () => {
    const result = AppointmentRequestSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('rejects missing required fields', () => {
    const result = AppointmentRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const bad = { ...validPayload, email: 'not-an-email' }
    const result = AppointmentRequestSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('rejects invalid date', () => {
    const bad = { ...validPayload, start: 'not-a-date' }
    const result = AppointmentRequestSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('rejects invalid payment method', () => {
    const bad = { ...validPayload, paymentMethod: 'invalid-method' }
    const result = AppointmentRequestSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('accepts payload with only telegramHandle (no phone)', () => {
    const { phone, ...rest } = validPayload
    const result = AppointmentRequestSchema.safeParse({ ...rest, telegramHandle: '@alice' })
    expect(result.success).toBe(true)
  })

  it('accepts payload with both phone and telegramHandle', () => {
    const result = AppointmentRequestSchema.safeParse({
      ...validPayload,
      telegramHandle: '@alice',
    })
    expect(result.success).toBe(true)
  })

  it('rejects payload with neither phone nor telegramHandle', () => {
    const { phone, ...rest } = validPayload
    const result = AppointmentRequestSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects payload with empty phone and empty telegramHandle', () => {
    const result = AppointmentRequestSchema.safeParse({
      ...validPayload,
      phone: '',
      telegramHandle: '',
    })
    expect(result.success).toBe(false)
  })
})
