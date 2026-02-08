import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('crypto', () => ({
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'mocked_hash'),
  })),
  default: {
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => 'mocked_hash'),
    })),
  },
}))

// Import after mocking
import { getHash } from '@/lib/hash'
import { createHash } from 'crypto'

describe('getHash', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return the correct hash when GOOGLE_OAUTH_SECRET is set', () => {
    process.env.GOOGLE_OAUTH_SECRET = 'secret'
    const result = getHash('data')
    expect(result).toBe('mocked_hash')
  })

  it('should throw when GOOGLE_OAUTH_SECRET is not set', () => {
    delete process.env.GOOGLE_OAUTH_SECRET
    expect(() => getHash('data')).toThrow(
      'GOOGLE_OAUTH_SECRET environment variable is required for hashing'
    )
  })
})
