import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '../route'

const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

const TENANT_ENV_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'TENANT_SLUG']

function setTenantEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  process.env.TENANT_SLUG = 'test_tenant'
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  for (const k of TENANT_ENV_KEYS) delete process.env[k]
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

describe('/api/health — tenant readiness', () => {
  beforeEach(() => {
    mockFrom.mockReturnValue({
      select: () => ({ limit: () => Promise.resolve({ error: null }) }),
    })
  })

  it('returns tenant: not_configured when env vars are missing', async () => {
    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.tenant).toBe('not_configured')
  })

  it('returns tenant: ready when admin_emails has rows', async () => {
    setTenantEnv()
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ email: 'owner@example.com' }],
    } as Response)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.tenant).toBe('ready')
  })

  it('returns tenant: no_owner_seeded (503) when admin_emails is empty', async () => {
    setTenantEnv()
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.tenant).toBe('no_owner_seeded')
  })

  it('returns tenant: unprovisioned (503) when REST query fails', async () => {
    setTenantEnv()
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.tenant).toBe('unprovisioned')
  })

  it('returns tenant: unprovisioned (503) when fetch throws', async () => {
    setTenantEnv()
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('network'))

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.tenant).toBe('unprovisioned')
  })

  it('sends Accept-Profile header with tenant slug', async () => {
    setTenantEnv()
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ email: 'a@b.com' }],
    } as Response)

    await GET()

    expect(global.fetch).toHaveBeenCalledWith(
      'https://test.supabase.co/rest/v1/admin_emails?select=email&limit=1',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept-Profile': 'test_tenant',
        }),
      })
    )
  })
})
