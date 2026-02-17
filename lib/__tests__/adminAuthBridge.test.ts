import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/lib/posthog-server', () => ({
  isFeatureEnabled: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  isAdmin: vi.fn(),
  getUser: vi.fn(),
}))

vi.mock('@/lib/adminAuth', () => ({
  AdminAuthManager: {
    requireAdmin: vi.fn(),
  },
}))

import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { isFeatureEnabled } from '@/lib/posthog-server'
import { isAdmin, getUser } from '@/lib/supabase/server'
import { AdminAuthManager } from '@/lib/adminAuth'

const mockRequest = new Request('http://localhost/api/test')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('requireAdminWithFlag', () => {
  it('delegates to AdminAuthManager when flag is off', async () => {
    vi.mocked(getUser).mockResolvedValue({ email: 'admin@test.com' } as never)
    vi.mocked(isFeatureEnabled).mockResolvedValue(false)
    vi.mocked(AdminAuthManager.requireAdmin).mockReturnValue({ email: 'admin@test.com' })

    const result = await requireAdminWithFlag(mockRequest)

    expect(AdminAuthManager.requireAdmin).toHaveBeenCalledWith(mockRequest)
    expect(result).toEqual({ email: 'admin@test.com' })
  })

  it('uses Supabase auth when flag is on and user is admin', async () => {
    vi.mocked(getUser).mockResolvedValue({ email: 'admin@test.com' } as never)
    vi.mocked(isFeatureEnabled).mockResolvedValue(true)
    vi.mocked(isAdmin).mockResolvedValue(true)

    const result = await requireAdminWithFlag(mockRequest)

    expect(AdminAuthManager.requireAdmin).not.toHaveBeenCalled()
    expect(result).toEqual({ email: 'admin@test.com' })
  })

  it('returns 401 when flag is on but user is not admin', async () => {
    vi.mocked(getUser).mockResolvedValue({ email: 'user@test.com' } as never)
    vi.mocked(isFeatureEnabled).mockResolvedValue(true)
    vi.mocked(isAdmin).mockResolvedValue(false)

    const result = await requireAdminWithFlag(mockRequest)

    expect(result).toBeInstanceOf(NextResponse)
    const json = await (result as NextResponse).json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 401 when flag is on but no user', async () => {
    vi.mocked(getUser).mockResolvedValue(null as never)
    vi.mocked(isFeatureEnabled).mockResolvedValue(true)
    vi.mocked(isAdmin).mockResolvedValue(false)

    const result = await requireAdminWithFlag(mockRequest)

    expect(result).toBeInstanceOf(NextResponse)
  })

  it('uses anonymous as distinctId when no user email', async () => {
    vi.mocked(getUser).mockResolvedValue(null as never)
    vi.mocked(isFeatureEnabled).mockResolvedValue(false)
    vi.mocked(AdminAuthManager.requireAdmin).mockReturnValue({ email: 'admin@test.com' })

    await requireAdminWithFlag(mockRequest)

    expect(isFeatureEnabled).toHaveBeenCalledWith('use-supabase-admin-auth', 'anonymous')
  })
})
