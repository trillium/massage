import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'

const mockSelect = vi.fn()
const mockOrder = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  isAdmin: vi.fn(),
  getSupabaseAdminClient: vi.fn(() => ({
    from: () => ({
      select: (...args: unknown[]) => {
        mockSelect(...args)
        return { order: mockOrder }
      },
    }),
  })),
}))

import { isAdmin } from '@/lib/supabase/server'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('/api/auth/supabase/admin/users', () => {
  it('returns users when admin', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true)
    mockOrder.mockResolvedValue({
      data: [
        { id: 'u1', role: 'admin' },
        { id: 'u2', role: 'user' },
      ],
      error: null,
    })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.users).toHaveLength(2)
    expect(mockSelect).toHaveBeenCalledWith('*')
  })

  it('returns 403 when not admin', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(403)
    expect(json.error).toContain('Forbidden')
  })

  it('returns 500 when query fails', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true)
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Failed to fetch users')
  })
})
