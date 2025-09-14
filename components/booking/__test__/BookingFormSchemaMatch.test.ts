import { describe, it, expect } from 'vitest'
import { AppointmentRequestSchema } from '@/lib/schema'
import { buildBookingPayload } from '@/components/booking/handleSubmit'

// Simulate a BookingForm submission and check schema compatibility

describe('BookingForm submission matches AppointmentRequestSchema', () => {
  it('should produce a payload that matches the API schema', () => {
    // Simulate form data as would be submitted by BookingForm
    const formData = new FormData()
    formData.set('firstName', 'Jane')
    formData.set('lastName', 'Doe')
    formData.set('email', 'jane@example.com')
    formData.set('location', '123 Main St')
    formData.set('city', 'San Francisco') // <-- Added city for schema compliance
    formData.set('zipCode', '94110') // <-- Added zipCode for TDD
    formData.set('phone', '555-123-4567')
    formData.set('paymentMethod', 'cash')
    formData.set('start', '2025-06-15T10:00:00-07:00')
    formData.set('end', '2025-06-15T11:30:00-07:00')
    formData.set('duration', '90')
    formData.set('price', '210')
    formData.set('timeZone', 'America/Los_Angeles')
    formData.set('eventBaseString', '__EVENT__')
    formData.set('eventMemberString', 'member')
    formData.set('eventContainerString', 'container')

    // Simulate any additionalData passed to buildBookingPayload
    const additionalData = {}

    // Add instantConfirm as boolean
    const payload = {
      ...buildBookingPayload(formData, additionalData),
      instantConfirm: false,
    }

    // Validate the payload against the API schema
    const result = AppointmentRequestSchema.safeParse(payload)
    if (!result.success) {
      // Print detailed error for debugging

      console.error(result.error)
    }
    expect(result.success).toBe(true)
  })

  it('should fail if extra fields are present in the payload', () => {
    const formData = new FormData()
    formData.set('firstName', 'Jane')
    formData.set('lastName', 'Doe')
    formData.set('email', 'jane@example.com')
    formData.set('location', '123 Main St')
    formData.set('city', 'San Francisco') // <-- Added city for schema compliance
    formData.set('zipCode', '94110') // <-- Added zipCode for TDD
    formData.set('phone', '555-123-4567')
    formData.set('paymentMethod', 'cash')
    formData.set('start', '2025-06-15T10:00:00-07:00')
    formData.set('end', '2025-06-15T11:30:00-07:00')
    formData.set('duration', '90')
    formData.set('price', '210')
    formData.set('timeZone', 'America/Los_Angeles')
    formData.set('eventBaseString', '__EVENT__')
    formData.set('eventMemberString', 'member')
    formData.set('eventContainerString', 'container')
    const additionalData = {}
    const payload = {
      ...buildBookingPayload(formData, additionalData),
      instantConfirm: false,
      extraField: 'should not be allowed',
    }
    const result = AppointmentRequestSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })
})
