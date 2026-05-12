import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '../route'

const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

const TENANT_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'TENANT_SLUG',
  'NEXT_PUBLIC_TENANT_SLUG',
  'SUPABASE_MANAGEMENT_API_TOKEN',
]

function setTenantEnv(overrides: Record<string, string> = {}) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  process.env.TENANT_SLUG = 'test_tenant'
  process.env.NEXT_PUBLIC_TENANT_SLUG = 'test_tenant'
  Object.assign(process.env, overrides)
}

function mockSupabaseOk() {
  mockFrom.mockReturnValue({
    select: () => ({ limit: () => Promise.resolve({ error: null }) }),
  })
}

function mockAdminEmailsFetch(rows: object[]) {
  vi.mocked(global.fetch).mockImplementation(async (url) => {
    if (String(url).includes('admin_emails')) {
      return { ok: true, json: async () => rows } as Response
    }
    return { ok: false, status: 404 } as Response
  })
}

function mockGoogleFetch(rows: object[]) {
  vi.mocked(global.fetch).mockImplementation(async (url) => {
    if (String(url).includes('admin_emails')) {
      return { ok: true, json: async () => [{ email: 'owner@example.com' }] } as Response
    }
    if (String(url).includes('google_credentials')) {
      return { ok: true, json: async () => rows } as Response
    }
    return { ok: false, status: 404 } as Response
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  for (const k of TENANT_ENV_KEYS) delete process.env[k]
})

describe('/api/health — supabase connectivity', () => {
  it('returns ok when supabase is reachable', async () => {
    setTenantEnv()
    mockSupabaseOk()
    mockAdminEmailsFetch([{ email: 'owner@example.com' }])

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.status).toBe('ok')
    expect(json.checks.supabase.ok).toBe(true)
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
    expect(json.checks.supabase.ok).toBe(false)
    expect(json.checks.supabase.detail).toBe('connection refused')
  })

  it('returns 503 when supabase is unreachable', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('network error')
    })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.status).toBe('error')
    expect(json.checks.supabase.detail).toBe('unreachable')
  })
})

describe('/api/health — config validation', () => {
  beforeEach(() => {
    mockSupabaseOk()
    mockAdminEmailsFetch([{ email: 'owner@example.com' }])
  })

  it('returns ok with no warnings when slug is valid', async () => {
    setTenantEnv()

    const res = await GET()
    const json = await res.json()

    expect(json.checks.config.ok).toBe(true)
    expect(json.checks.config.warnings).toHaveLength(0)
  })

  it('returns degraded when TENANT_SLUG contains uppercase', async () => {
    setTenantEnv({ TENANT_SLUG: 'Sarah_Music', NEXT_PUBLIC_TENANT_SLUG: 'Sarah_Music' })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.status).toBe('degraded')
    expect(json.checks.config.ok).toBe(false)
    expect(json.checks.config.warnings).toEqual(
      expect.arrayContaining([expect.stringMatching(/uppercase/)])
    )
  })

  it('returns degraded when TENANT_SLUG contains spaces', async () => {
    setTenantEnv({ TENANT_SLUG: 'sarah music', NEXT_PUBLIC_TENANT_SLUG: 'sarah music' })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.checks.config.ok).toBe(false)
    expect(json.checks.config.warnings).toEqual(
      expect.arrayContaining([expect.stringMatching(/uppercase or spaces/)])
    )
  })

  it('returns degraded when TENANT_SLUG and NEXT_PUBLIC_TENANT_SLUG do not match', async () => {
    setTenantEnv({ TENANT_SLUG: 'tenant_a', NEXT_PUBLIC_TENANT_SLUG: 'tenant_b' })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.checks.config.ok).toBe(false)
    expect(json.checks.config.warnings).toEqual(
      expect.arrayContaining([expect.stringMatching(/do not match/)])
    )
  })
})

describe('/api/health — provisioning', () => {
  beforeEach(() => {
    mockSupabaseOk()
    setTenantEnv()
  })

  it('returns tenant: not_configured when env vars are missing', async () => {
    delete process.env.TENANT_SLUG

    const res = await GET()
    const json = await res.json()

    expect(json.checks.provisioning.tenant).toBe('not_configured')
    expect(json.checks.provisioning.ok).toBe(false)
  })

  it('returns tenant: ready when admin_emails has rows', async () => {
    mockAdminEmailsFetch([{ email: 'owner@example.com' }])

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.checks.provisioning.tenant).toBe('ready')
    expect(json.checks.provisioning.ok).toBe(true)
  })

  it('returns tenant: no_owner_seeded (503) when admin_emails is empty', async () => {
    mockAdminEmailsFetch([])

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.checks.provisioning.tenant).toBe('no_owner_seeded')
    expect(json.checks.provisioning.ok).toBe(false)
  })

  it('returns tenant: unprovisioned (503) when REST query fails', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: false, status: 404 } as Response)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.checks.provisioning.tenant).toBe('unprovisioned')
  })

  it('returns tenant: unprovisioned (503) when fetch throws', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('network'))

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.checks.provisioning.tenant).toBe('unprovisioned')
  })

  it('sends Accept-Profile header with tenant slug', async () => {
    mockAdminEmailsFetch([{ email: 'a@b.com' }])

    await GET()

    expect(global.fetch).toHaveBeenCalledWith(
      'https://test.supabase.co/rest/v1/admin_emails?select=email&limit=1',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Accept-Profile': 'test_tenant' }),
      })
    )
  })
})

describe('/api/health — google credentials', () => {
  beforeEach(() => {
    mockSupabaseOk()
    setTenantEnv()
  })

  it('reports google ok when credentials exist', async () => {
    mockGoogleFetch([{ email: 'owner@gmail.com' }])

    const res = await GET()
    const json = await res.json()

    expect(json.checks.google.ok).toBe(true)
  })

  it('reports google not ok with detail when no credentials', async () => {
    mockGoogleFetch([])

    const res = await GET()
    const json = await res.json()

    expect(json.checks.google.ok).toBe(false)
    expect(json.checks.google.detail).toMatch(/connect-google/)
  })

  it('does not degrade overall status when google is not connected', async () => {
    mockGoogleFetch([])
    mockAdminEmailsFetch([{ email: 'owner@example.com' }])

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.status).toBe('ok')
    expect(json.checks.google.ok).toBe(false)
  })
})

describe('/api/health — management API', () => {
  beforeEach(() => {
    mockSupabaseOk()
    setTenantEnv()
    mockAdminEmailsFetch([{ email: 'owner@example.com' }])
    mockGoogleFetch([{ email: 'owner@gmail.com' }])
  })

  it('reports management_api ok when token is set', async () => {
    process.env.SUPABASE_MANAGEMENT_API_TOKEN = 'test-token'

    const res = await GET()
    const json = await res.json()

    expect(json.checks.management_api.ok).toBe(true)
  })

  it('reports management_api not ok with detail when token is absent', async () => {
    const res = await GET()
    const json = await res.json()

    expect(json.checks.management_api.ok).toBe(false)
    expect(json.checks.management_api.detail).toMatch(/manually/)
  })

  it('does not degrade overall status when management token is absent', async () => {
    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.status).toBe('ok')
  })
})
