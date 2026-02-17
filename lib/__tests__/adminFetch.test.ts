import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminFetch, AdminFetchError } from '../adminFetch'

const mockGetSession = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: { getSession: mockGetSession },
  }),
}))

const mockFetch = vi.fn<(url: string, options?: RequestInit) => Promise<Response>>(() =>
  Promise.resolve(new Response('ok', { status: 200 }))
)
vi.stubGlobal('fetch', mockFetch)

describe('adminFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetch with credentials when session exists', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { email: 'admin@test.com' } } },
    })

    await adminFetch('/api/admin/test', { method: 'POST' })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/admin/test')
    expect(options!.method).toBe('POST')
    expect(options!.credentials).toBe('same-origin')
  })

  it('throws AdminFetchError when no session exists', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    await expect(adminFetch('/api/admin/test')).rejects.toThrow(AdminFetchError)
    await expect(adminFetch('/api/admin/test')).rejects.toThrow('No active admin session')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('preserves method and body from caller', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { email: 'admin@test.com' } } },
    })

    const body = JSON.stringify({ data: 'test' })
    await adminFetch('/api/test', {
      method: 'PATCH',
      body,
    })

    const [, options] = mockFetch.mock.calls[0]
    expect(options!.method).toBe('PATCH')
    expect(options!.body).toBe(body)
  })
})
