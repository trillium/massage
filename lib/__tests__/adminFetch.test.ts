import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminFetch, AdminFetchError } from '../adminFetch'
import { AdminAuthManager } from '../adminAuth'

vi.mock('../adminAuth', () => ({
  AdminAuthManager: {
    validateSession: vi.fn(),
  },
}))

const mockFetch = vi.fn(() => Promise.resolve(new Response('ok', { status: 200 })))
vi.stubGlobal('fetch', mockFetch)

describe('adminFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('attaches auth headers when session is valid', async () => {
    vi.mocked(AdminAuthManager.validateSession).mockReturnValue({
      email: 'admin@test.com',
      token: 'valid-token',
      timestamp: Date.now(),
      expiresAt: Date.now() + 86400000,
    })

    await adminFetch('/api/admin/test', { method: 'POST' })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/admin/test')
    expect(options.method).toBe('POST')
    const headers = new Headers(options.headers)
    expect(headers.get('x-admin-email')).toBe('admin@test.com')
    expect(headers.get('x-admin-token')).toBe('valid-token')
  })

  it('throws AdminFetchError when no session exists', async () => {
    vi.mocked(AdminAuthManager.validateSession).mockReturnValue(null)

    await expect(adminFetch('/api/admin/test')).rejects.toThrow(AdminFetchError)
    await expect(adminFetch('/api/admin/test')).rejects.toThrow('No active admin session')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('preserves existing headers from caller', async () => {
    vi.mocked(AdminAuthManager.validateSession).mockReturnValue({
      email: 'admin@test.com',
      token: 'valid-token',
      timestamp: Date.now(),
      expiresAt: Date.now() + 86400000,
    })

    await adminFetch('/api/test', {
      headers: { 'Content-Type': 'application/json' },
    })

    const [, options] = mockFetch.mock.calls[0]
    const headers = new Headers(options.headers)
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('x-admin-email')).toBe('admin@test.com')
    expect(headers.get('x-admin-token')).toBe('valid-token')
  })

  it('preserves method and body from caller', async () => {
    vi.mocked(AdminAuthManager.validateSession).mockReturnValue({
      email: 'admin@test.com',
      token: 'valid-token',
      timestamp: Date.now(),
      expiresAt: Date.now() + 86400000,
    })

    const body = JSON.stringify({ data: 'test' })
    await adminFetch('/api/test', {
      method: 'PATCH',
      body,
    })

    const [, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(body)
  })
})
