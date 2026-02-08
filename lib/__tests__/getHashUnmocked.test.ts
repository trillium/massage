import { getHash } from '@/lib/hash'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getHash unmocked', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    vi.unmock('crypto')
    process.env = { ...originalEnv }
  })

  it('should return a hash when GOOGLE_OAUTH_SECRET is set', () => {
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'
    const result = getHash('data')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should throw when GOOGLE_OAUTH_SECRET is not set', () => {
    delete process.env.GOOGLE_OAUTH_SECRET
    expect(() => getHash('data')).toThrow(
      'GOOGLE_OAUTH_SECRET environment variable is required for hashing'
    )
  })

  it('should use explicit key parameter when provided', () => {
    delete process.env.GOOGLE_OAUTH_SECRET
    const result = getHash('data', 'explicit_key')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
