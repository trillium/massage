import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'

const mockRpc = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  isAdmin: vi.fn(),
  getSupabaseAdminClient: vi.fn(() => ({
    rpc: mockRpc,
  })),
}))

import { isAdmin } from '@/lib/supabase/server'

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/auth/supabase/admin/demote', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('/api/auth/supabase/admin/demote', () => {
  it('demotes user when admin', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true)
    mockRpc.mockResolvedValue({ error: null })

    const res = await POST(makeRequest({ userId: 'user-1' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('demote_to_user', { user_id: 'user-1' })
  })

  it('returns 403 when not admin', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false)

    const res = await POST(makeRequest({ userId: 'user-1' }))
    const json = await res.json()

    expect(res.status).toBe(403)
    expect(json.error).toContain('Forbidden')
  })

  it('returns 400 when userId is missing', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true)

    const res = await POST(makeRequest({}))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('userId is required')
  })

  it('returns 500 when rpc fails', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true)
    mockRpc.mockResolvedValue({ error: { message: 'RPC error' } })

    const res = await POST(makeRequest({ userId: 'user-1' }))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('RPC error')
  })
})
