import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'

const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('/api/health', () => {
  it('returns ok when supabase is reachable', async () => {
    mockFrom.mockReturnValue({
      select: () => ({ limit: () => Promise.resolve({ error: null }) }),
    })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.status).toBe('ok')
    expect(json.supabase).toBe('connected')
    expect(json.timestamp).toBeDefined()
  })

  it('returns 503 when supabase query fails', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        limit: () => Promise.resolve({ error: { message: 'connection refused' } }),
      }),
    })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.status).toBe('degraded')
    expect(json.supabase).toBe('error')
    expect(json.detail).toBe('connection refused')
  })

  it('returns 503 when supabase is unreachable', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('network error')
    })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.status).toBe('error')
    expect(json.supabase).toBe('unreachable')
  })
})
