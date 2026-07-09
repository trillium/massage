import { describe, it, expect } from 'vitest'
import {
  parseCookieHeader,
  distinctIdFromCookieValue,
  distinctIdFromCookieRecord,
  distinctIdFromCookieHeader,
} from '@/lib/ref/distinctId'

const phCookie = (distinctId: string) =>
  encodeURIComponent(JSON.stringify({ distinct_id: distinctId, $sesid: [1, 'x'] }))

describe('parseCookieHeader', () => {
  it('parses a multi-cookie header into a record', () => {
    const record = parseCookieHeader('a=1; b=two; ph_abc_posthog=xyz')
    expect(record).toMatchObject({ a: '1', b: 'two', ph_abc_posthog: 'xyz' })
  })

  it('returns an empty record for blank/undefined input', () => {
    expect(parseCookieHeader('')).toEqual({})
    expect(parseCookieHeader(undefined)).toEqual({})
    expect(parseCookieHeader(null)).toEqual({})
  })
})

describe('distinctIdFromCookieValue', () => {
  it('extracts distinct_id from a URL-encoded posthog blob', () => {
    expect(distinctIdFromCookieValue(phCookie('person-123'))).toBe('person-123')
  })

  it('returns null for malformed or empty values', () => {
    expect(distinctIdFromCookieValue('not-json')).toBeNull()
    expect(distinctIdFromCookieValue('')).toBeNull()
    expect(distinctIdFromCookieValue(undefined)).toBeNull()
    expect(distinctIdFromCookieValue(encodeURIComponent(JSON.stringify({})))).toBeNull()
  })
})

describe('distinctIdFromCookieRecord / Header', () => {
  it('finds the ph_<key>_posthog cookie regardless of project key', () => {
    const record = { unrelated: 'x', ph_phc_ZZZ_posthog: phCookie('abc') }
    expect(distinctIdFromCookieRecord(record)).toBe('abc')
  })

  it('resolves from a raw cookie header', () => {
    const header = `foo=bar; ph_phc_test_posthog=${phCookie('visitor-9')}`
    expect(distinctIdFromCookieHeader(header)).toBe('visitor-9')
  })

  it('returns null when no posthog cookie is present', () => {
    expect(distinctIdFromCookieRecord({ foo: 'bar' })).toBeNull()
    expect(distinctIdFromCookieHeader('foo=bar')).toBeNull()
    expect(distinctIdFromCookieHeader(null)).toBeNull()
  })
})
