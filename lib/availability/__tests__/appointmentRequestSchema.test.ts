import { describe, it, expect, type Mock, type Mocked } from 'vitest'
import { AppointmentRequestSchema } from '@/lib/schema'

describe('AppointmentRequestSchema', () => {
  it('should validate a correct appointment request', async () => {
    const validData = {
      firstName: 'Testy',
      lastName: 'Tester',
      email: 'testy@example.com',
      locationObject: {
        street: '123 Address Road',
        city: 'Testville',
        zip: '00040',
      },
      phone: '555-444-3333',
      paymentMethod: 'cash',
      start: '2024-09-01T10:00:00-07:00',
      end: '2024-09-01T11:30:00-07:00',
      duration: '90',
      price: '210',
      timeZone: 'America/Los_Angeles',
      eventBaseString: '__EVENT__',
    }

    const validationResult = AppointmentRequestSchema.safeParse(validData)
    await expect(validationResult.success).toBe(true)
  })

  it('should invalidate an appointment request with missing fields', async () => {
    const invalidData = {
      firstName: 'Testy',
      lastName: 'Tester',
      email: 'testy@example.com',
      locationObject: {
        street: '123 Address Road',
        city: 'City',
        zip: '00040',
      },
      phone: '555-444-3333',
      paymentMethod: 'cash',
      start: '2024-09-01T10:00:00-07:00',
      end: '2024-09-01T11:30:00-07:00',
      // duration: "90",
      // price: "210",
      timeZone: 'America/Los_Angeles',
    }

    const validationResult = AppointmentRequestSchema.safeParse(invalidData)
    await expect(validationResult.success).toBe(false)
  })

  it('should invalidate an appointment request with incorrect email', async () => {
    const invalidData = {
      firstName: 'Testy',
      lastName: 'Tester',
      email: 'testyexample.com',
      locationObject: {
        street: '123 Address Road',
        city: 'City',
        zip: '00040',
      },
      phone: '555-444-3333',
      paymentMethod: 'cash',
      start: '2024-09-01T10:00:00-07:00',
      end: '2024-09-01T11:30:00-07:00',
      duration: '90',
      price: '210',
      timeZone: 'America/Los_Angeles',
    }

    const validationResult = AppointmentRequestSchema.safeParse(invalidData)
    await expect(validationResult.success).toBe(false)
  })

  it('should invalidate an appointment request with incorrect payment method', async () => {
    const invalidData = {
      firstName: 'Testy',
      lastName: 'Tester',
      email: 'testy@example.com',
      locationObject: {
        street: '123 Address Road',
        city: 'City',
        zip: '00040',
      },
      phone: '555-444-3333',
      start: '2024-09-01T10:00:00-07:00',
      end: '2024-09-01T11:30:00-07:00',
      duration: '90',
      price: '210',
      timeZone: 'America/Los_Angeles',
      paymentMethod: 'exposure',
    }

    const validationResult = AppointmentRequestSchema.safeParse(invalidData)
    await expect(validationResult.success).toBe(false)
  })

  describe('phone-or-telegram contact requirement', () => {
    const baseValidData = {
      firstName: 'Testy',
      lastName: 'Tester',
      email: 'testy@example.com',
      locationObject: {
        street: '123 Address Road',
        city: 'City',
        zip: '00040',
      },
      paymentMethod: 'cash',
      start: '2024-09-01T10:00:00-07:00',
      end: '2024-09-01T11:30:00-07:00',
      duration: '90',
      price: '210',
      timeZone: 'America/Los_Angeles',
      eventBaseString: '__EVENT__',
    }

    it('accepts when only phone is provided', () => {
      const data = { ...baseValidData, phone: '555-444-3333' }
      const result = AppointmentRequestSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts when only telegramHandle is provided', () => {
      const data = { ...baseValidData, telegramHandle: '@johndoe' }
      const result = AppointmentRequestSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts when both phone and telegramHandle are provided', () => {
      const data = {
        ...baseValidData,
        phone: '555-444-3333',
        telegramHandle: '@johndoe',
      }
      const result = AppointmentRequestSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects when neither phone nor telegramHandle is provided', () => {
      const result = AppointmentRequestSchema.safeParse(baseValidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message)
        expect(messages).toContain('Either phone or telegram handle must be provided.')
      }
    })

    it('rejects when phone and telegramHandle are both empty strings', () => {
      const data = { ...baseValidData, phone: '', telegramHandle: '' }
      const result = AppointmentRequestSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects when phone and telegramHandle are only whitespace', () => {
      const data = { ...baseValidData, phone: '   ', telegramHandle: '\t\n ' }
      const result = AppointmentRequestSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
