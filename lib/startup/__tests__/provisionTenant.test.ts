import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// provisionTenant reads env vars AND the `provisioned` flag at module scope.
// Each test gets a fresh module via vi.resetModules() + dynamic import so state
// never leaks between tests.

const BASE_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  TENANT_SLUG: 'test_tenant',
}

async function loadModule(
  overrides: Record<string, string | undefined> = {}
): Promise<() => Promise<void>> {
  const env = { ...BASE_ENV, ...overrides }
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
  vi.resetModules()
  const mod = await import('../provisionTenant')
  return mod.provisionTenant
}

const ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'TENANT_SLUG',
  'TENANT_DOMAIN',
  'OWNER_EMAIL',
]

beforeEach(() => {
  vi.mocked(global.fetch).mockResolvedValue({ ok: true, text: async () => '' } as Response)
})

afterEach(() => {
  for (const k of ENV_KEYS) delete process.env[k]
  vi.clearAllMocks()
})

// ─── env var guards ───────────────────────────────────────────────────────────

describe('env var guards — no fetch when config incomplete', () => {
  it('skips when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    const pt = await loadModule({ NEXT_PUBLIC_SUPABASE_URL: undefined })
    await pt()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('skips when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    const pt = await loadModule({ SUPABASE_SERVICE_ROLE_KEY: undefined })
    await pt()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('skips when TENANT_SLUG is missing', async () => {
    const pt = await loadModule({ TENANT_SLUG: undefined })
    await pt()
    expect(global.fetch).not.toHaveBeenCalled()
  })
})

// ─── fetch call shape ─────────────────────────────────────────────────────────

describe('fetch call — URL and headers', () => {
  it('calls the create_tenant RPC endpoint', async () => {
    const pt = await loadModule()
    await pt()
    expect(global.fetch).toHaveBeenCalledWith(
      'https://test.supabase.co/rest/v1/rpc/create_tenant',
      expect.anything()
    )
  })

  it('sends apikey header with the service role key', async () => {
    const pt = await loadModule()
    await pt()
    const [, opts] = vi.mocked(global.fetch).mock.calls[0]
    expect((opts as RequestInit).headers).toMatchObject({ apikey: 'test-service-key' })
  })

  it('sends Authorization: Bearer with the service role key', async () => {
    const pt = await loadModule()
    await pt()
    const [, opts] = vi.mocked(global.fetch).mock.calls[0]
    expect((opts as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-service-key',
    })
  })

  it('sends Content-Type: application/json', async () => {
    const pt = await loadModule()
    await pt()
    const [, opts] = vi.mocked(global.fetch).mock.calls[0]
    expect((opts as RequestInit).headers).toMatchObject({ 'Content-Type': 'application/json' })
  })
})

// ─── fetch body ───────────────────────────────────────────────────────────────

describe('fetch call — body', () => {
  it('includes p_tenant_slug matching TENANT_SLUG', async () => {
    const pt = await loadModule()
    await pt()
    const [, opts] = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse((opts as RequestInit).body as string)
    expect(body.p_tenant_slug).toBe('test_tenant')
  })

  it('includes p_domain when TENANT_DOMAIN is set', async () => {
    const pt = await loadModule({ TENANT_DOMAIN: 'example.com' })
    await pt()
    const [, opts] = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse((opts as RequestInit).body as string)
    expect(body.p_domain).toBe('example.com')
  })

  it('p_domain is null when TENANT_DOMAIN is not set', async () => {
    const pt = await loadModule({ TENANT_DOMAIN: undefined })
    await pt()
    const [, opts] = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse((opts as RequestInit).body as string)
    expect(body.p_domain).toBeNull()
  })

  it('includes p_owner_email when OWNER_EMAIL is set', async () => {
    const pt = await loadModule({ OWNER_EMAIL: 'owner@example.com' })
    await pt()
    const [, opts] = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse((opts as RequestInit).body as string)
    expect(body.p_owner_email).toBe('owner@example.com')
  })

  it('p_owner_email is null when OWNER_EMAIL is not set', async () => {
    const pt = await loadModule({ OWNER_EMAIL: undefined })
    await pt()
    const [, opts] = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse((opts as RequestInit).body as string)
    expect(body.p_owner_email).toBeNull()
  })
})

// ─── idempotency ──────────────────────────────────────────────────────────────

describe('idempotency — provisioned flag', () => {
  it('only calls fetch once across multiple invocations', async () => {
    const pt = await loadModule()
    await pt()
    await pt()
    await pt()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})

// ─── error handling ───────────────────────────────────────────────────────────

describe('error handling', () => {
  it('does not throw when fetch returns non-ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    } as Response)

    const pt = await loadModule()
    await expect(pt()).resolves.toBeUndefined()
  })

  it('logs a warning when fetch returns non-ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom',
    } as Response)

    const pt = await loadModule()
    await pt()
    expect(console.warn).toHaveBeenCalled()
  })

  it('does not set provisioned when fetch returns non-ok — retries on next call', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => '' } as Response)
      .mockResolvedValueOnce({ ok: true, text: async () => '' } as Response)

    const pt = await loadModule()
    await pt()
    await pt()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('does not throw when fetch throws a network error', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network failure'))

    const pt = await loadModule()
    await expect(pt()).resolves.toBeUndefined()
  })

  it('logs a warning when fetch throws a network error', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network failure'))

    const pt = await loadModule()
    await pt()
    expect(console.warn).toHaveBeenCalled()
  })
})
