import { describe, it, expect } from 'vitest'
import { parseEventSummary } from '../parseEventSummary'

describe('parseEventSummary', () => {
  it('parses a confirmed event', () => {
    const result = parseEventSummary(
      '90 minute massage with John Doe - TrilliumMassage',
      'confirmed'
    )
    expect(result).toEqual({ status: 'confirmed', duration: 90, clientName: 'John Doe' })
  })

  it('parses a pending request event', () => {
    const result = parseEventSummary(
      'REQUEST: 60 minute massage with Jane Smith - TrilliumMassage',
      'confirmed'
    )
    expect(result).toEqual({ status: 'pending', duration: 60, clientName: 'Jane Smith' })
  })

  it('detects cancelled from calendar status', () => {
    const result = parseEventSummary(
      '90 minute massage with John Doe - TrilliumMassage',
      'cancelled'
    )
    expect(result.status).toBe('cancelled')
    expect(result.duration).toBe(90)
  })

  it('cancelled overrides pending', () => {
    const result = parseEventSummary(
      'REQUEST: 60 minute massage with Jane Smith - TrilliumMassage',
      'cancelled'
    )
    expect(result.status).toBe('cancelled')
  })

  it('handles unrecognized summary format', () => {
    const result = parseEventSummary('Team Meeting', 'confirmed')
    expect(result).toEqual({ status: 'confirmed', duration: null, clientName: null })
  })
})
