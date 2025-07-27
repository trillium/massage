import { describe, it, expect } from 'vitest'
import { buildBookingPayload } from '../handleSubmit'

describe('buildBookingPayload', () => {
  it('merges form data and additional data', () => {
    const form = new FormData()
    form.append('firstName', 'Alice')
    form.append('lastName', 'Smith')
    const additional = { foo: 'bar', lastName: 'Override' }
    const result = buildBookingPayload(form, additional)
    expect(result).toEqual({ firstName: 'Alice', lastName: 'Override', foo: 'bar' })
  })

  it('returns only form data if no additional data', () => {
    const form = new FormData()
    form.append('email', 'test@example.com')
    const result = buildBookingPayload(form)
    expect(result).toEqual({ email: 'test@example.com' })
  })
})
