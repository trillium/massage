import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getHash } from '@/lib/hash'
import { createHash } from 'crypto'

let updateMock: ReturnType<typeof vi.fn>
let digestMock: ReturnType<typeof vi.fn>
let createHashMock: ReturnType<typeof vi.fn>

vi.mock('crypto', () => {
  updateMock = vi.fn().mockReturnThis()
  digestMock = vi.fn().mockReturnValue('mocked_hash')
  createHashMock = vi.fn().mockReturnValue({ update: updateMock, digest: digestMock })
  return {
    createHash: createHashMock,
    default: { createHash: createHashMock },
  }
})

describe('getHash', () => {
  // Use global beforeEach from vitest
  beforeEach(() => {
    updateMock.mockClear()
    digestMock.mockClear()
    createHashMock.mockClear()
  })

  it('should return the correct hash when GOOGLE_OAUTH_SECRET is set', () => {
    process.env.GOOGLE_OAUTH_SECRET = 'secret'
    const result = getHash('data')
    expect(result).toBe('mocked_hash')
    expect(updateMock).toHaveBeenCalledWith('datasecret')
  })

  it('should return the correct hash when GOOGLE_OAUTH_SECRET is not set', () => {
    delete process.env.GOOGLE_OAUTH_SECRET
    const result = getHash('data')
    expect(result).toBe('mocked_hash')
    expect(updateMock).toHaveBeenCalledWith('data')
  })
})
