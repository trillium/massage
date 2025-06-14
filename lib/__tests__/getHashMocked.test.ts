import { describe, it, expect, vi, type Mock, type Mocked } from 'vitest'
import { getHash } from '@/lib/hash'
import { createHash } from 'crypto'

vi.mock('crypto', () => ({
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mocked_hash'),
  }),
}))

describe('getHash', () => {
  it('should return the correct hash when GOOGLE_OAUTH_SECRET is set', () => {
    process.env.GOOGLE_OAUTH_SECRET = 'secret'
    const result = getHash('data')
    expect(result).toBe('mocked_hash')
    expect(createHash('sha256').update).toHaveBeenCalledWith('datasecret')
  })

  it('should return the correct hash when GOOGLE_OAUTH_SECRET is not set', () => {
    delete process.env.GOOGLE_OAUTH_SECRET
    const result = getHash('data')
    expect(result).toBe('mocked_hash')
    expect(createHash('sha256').update).toHaveBeenCalledWith('data')
  })
})
