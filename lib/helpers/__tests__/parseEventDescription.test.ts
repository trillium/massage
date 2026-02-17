import { describe, it, expect } from 'vitest'
import { parseEditableFields, updateDescriptionFields } from '../parseEventDescription'

const sampleDescription = `Thanks for booking!

<b>Name</b>: Jane Doe
<b>Date</b>: 2/17/2026
<b>Start</b>: 2:00:00 PM
<b>End</b>: 3:30:00 PM
<b>Duration</b>: 90
<b>Email</b>: jane@example.com
<b>Phone</b>: 555-1234
<b>Location</b>: 123 Main St, Los Angeles, 90001

Trillium Smith, LMT`

describe('parseEditableFields', () => {
  it('extracts name, phone, and location', () => {
    const result = parseEditableFields(sampleDescription)
    expect(result.firstName).toBe('Jane')
    expect(result.lastName).toBe('Doe')
    expect(result.phone).toBe('555-1234')
    expect(result.location).toBe('123 Main St, Los Angeles, 90001')
  })

  it('handles missing fields gracefully', () => {
    const result = parseEditableFields('No fields here')
    expect(result.firstName).toBe('')
    expect(result.lastName).toBe('')
    expect(result.phone).toBe('')
    expect(result.location).toBe('')
  })
})

describe('updateDescriptionFields', () => {
  it('updates name in description', () => {
    const updated = updateDescriptionFields(sampleDescription, {
      firstName: 'John',
      lastName: 'Smith',
    })
    expect(updated).toContain('<b>Name</b>: John Smith')
    expect(updated).not.toContain('Jane Doe')
  })

  it('updates phone in description', () => {
    const updated = updateDescriptionFields(sampleDescription, { phone: '999-8888' })
    expect(updated).toContain('<b>Phone</b>: 999-8888')
    expect(updated).not.toContain('555-1234')
  })

  it('updates location in description', () => {
    const updated = updateDescriptionFields(sampleDescription, { location: '456 Oak Ave' })
    expect(updated).toContain('<b>Location</b>: 456 Oak Ave')
  })

  it('preserves unmodified fields', () => {
    const updated = updateDescriptionFields(sampleDescription, { phone: '999-8888' })
    expect(updated).toContain('<b>Name</b>: Jane Doe')
    expect(updated).toContain('<b>Location</b>: 123 Main St, Los Angeles, 90001')
  })
})
