import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT } from '../route'

const mockSingle = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  getUser: vi.fn(),
  getSupabaseServerClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({ eq: () => ({ single: mockSingle }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: mockSingle }) }) }),
    }),
  })),
}))

import { getUser } from '@/lib/supabase/server'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('/api/auth/supabase/profile GET', () => {
  it('returns profile for authenticated user', async () => {
    vi.mocked(getUser).mockResolvedValue({ id: 'u1', email: 'user@test.com' } as never)
    mockSingle.mockResolvedValue({
      data: { id: 'u1', role: 'user', email: 'user@test.com' },
      error: null,
    })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.profile.id).toBe('u1')
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getUser).mockResolvedValue(null as never)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 500 on database error', async () => {
    vi.mocked(getUser).mockResolvedValue({ id: 'u1' } as never)
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Failed to fetch profile')
  })
})

describe('/api/auth/supabase/profile PUT', () => {
  it('updates allowed fields', async () => {
    vi.mocked(getUser).mockResolvedValue({ id: 'u1' } as never)
    mockSingle.mockResolvedValue({ data: { id: 'u1', email: 'new@test.com' }, error: null })

    const req = new Request('http://localhost/api/auth/supabase/profile', {
      method: 'PUT',
      body: JSON.stringify({ email: 'new@test.com' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await PUT(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.profile.email).toBe('new@test.com')
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getUser).mockResolvedValue(null as never)

    const req = new Request('http://localhost/api/auth/supabase/profile', {
      method: 'PUT',
      body: JSON.stringify({ email: 'new@test.com' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await PUT(req)
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 400 when no valid updates provided', async () => {
    vi.mocked(getUser).mockResolvedValue({ id: 'u1' } as never)

    const req = new Request('http://localhost/api/auth/supabase/profile', {
      method: 'PUT',
      body: JSON.stringify({ role: 'admin' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await PUT(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('No valid updates provided')
  })
})
