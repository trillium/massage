import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  isAdmin: vi.fn(),
  getUser: vi.fn(),
}))

import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { isAdmin, getUser } from '@/lib/supabase/server'

const mockRequest = new Request('http://localhost/api/test')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('requireAdminWithFlag', () => {
  it('returns email when user is admin', async () => {
    vi.mocked(getUser).mockResolvedValue({ email: 'admin@test.com' } as never)
    vi.mocked(isAdmin).mockResolvedValue(true)

    const result = await requireAdminWithFlag(mockRequest)

    expect(result).toEqual({ email: 'admin@test.com' })
  })

  it('returns 401 when user is not admin', async () => {
    vi.mocked(getUser).mockResolvedValue({ email: 'user@test.com' } as never)
    vi.mocked(isAdmin).mockResolvedValue(false)

    const result = await requireAdminWithFlag(mockRequest)

    expect(result).toBeInstanceOf(NextResponse)
    const json = await (result as NextResponse).json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 401 when no user', async () => {
    vi.mocked(getUser).mockResolvedValue(null as never)

    const result = await requireAdminWithFlag(mockRequest)

    expect(result).toBeInstanceOf(NextResponse)
    const json = await (result as NextResponse).json()
    expect(json.error).toBe('Unauthorized')
  })
})
