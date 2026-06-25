import { describe, expect, it } from 'vitest'
import { assertDateString, isDateString, toDateString } from '@/lib/temporal/brands'

describe('isDateString', () => {
  it('accepts YYYY-MM-DD', () => {
    expect(isDateString('2026-06-25')).toBe(true)
  })

  it('rejects ISO datetime', () => {
    expect(isDateString('2026-06-25T13:20:00-07:00')).toBe(false)
  })

  it('rejects single-digit components', () => {
    expect(isDateString('2026-6-5')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isDateString('')).toBe(false)
  })
})

describe('assertDateString', () => {
  it('returns branded value when valid', () => {
    expect(assertDateString('2026-06-25')).toBe('2026-06-25')
  })

  it('throws on invalid input', () => {
    expect(() => assertDateString('not-a-date')).toThrow(TypeError)
  })
})

describe('toDateString', () => {
  it('formats Pacific-zoned slot into Pacific calendar date', () => {
    expect(toDateString('2026-06-25T13:20:00-07:00', 'America/Los_Angeles')).toBe('2026-06-25')
  })

  it('respects the configured time zone when slot offset differs', () => {
    expect(toDateString('2026-06-26T02:00:00+00:00', 'America/Los_Angeles')).toBe('2026-06-25')
  })
})
