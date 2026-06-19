import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockExchangeCodeForSession, mockSaveGoogleCredentials } = vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
  mockSaveGoogleCredentials: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      getAll: vi.fn(() => []),
      set: vi.fn(),
    })
  ),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  })),
}))

vi.mock('@/lib/google/credentials', () => ({
  saveGoogleCredentials: mockSaveGoogleCredentials,
}))

import { GET } from '../route'

vi.mock('@/lib/supabase/cookie-options', () => ({
  getCookieOptionsWithDomain: vi.fn((opts) => opts),
}))

function makeRequest(params: Record<string, string>, headers: Record<string, string> = {}) {
  const url = new URL('http://localhost/auth/callback/connect-google')
  Object.entries(params).forEach(([k, v]) => {
    url.searchParams.set(k, v)
  })
  return new Request(url, {
    headers: { host: 'localhost:9876', ...headers },
  }) as unknown as import('next/server').NextRequest
}

function redirectedTo(response: Response) {
  return response.headers.get('location')
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /auth/callback/connect-google', () => {
  describe('origin construction', () => {
    it('uses x-forwarded-host and x-forwarded-proto when present', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'fail' },
      })

      const req = makeRequest(
        { code: 'abc' },
        { 'x-forwarded-host': 'myapp.com', 'x-forwarded-proto': 'https' }
      )
      const res = await GET(req)
      expect(redirectedTo(res)).toMatch(/^https:\/\/myapp\.com/)
    })

    it('falls back to host header with http', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'fail' },
      })

      const res = await GET(makeRequest({ code: 'abc' }))
      expect(redirectedTo(res)).toMatch(/^http:\/\/localhost:9876/)
    })
  })

  describe('error param', () => {
    it('redirects with the error when Supabase sends error param', async () => {
      const res = await GET(makeRequest({ error: 'access_denied' }))
      expect(redirectedTo(res)).toBe(
        'http://localhost:9876/admin/connect-google?error=access_denied'
      )
    })
  })

  describe('missing code', () => {
    it('redirects to authentication_failed when no code or error', async () => {
      const res = await GET(makeRequest({}))
      expect(redirectedTo(res)).toBe(
        'http://localhost:9876/admin/connect-google?error=authentication_failed'
      )
    })
  })

  describe('code exchange failure', () => {
    it('redirects to authentication_failed when exchange returns error', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'invalid code' },
      })

      const res = await GET(makeRequest({ code: 'bad-code' }))
      expect(redirectedTo(res)).toBe(
        'http://localhost:9876/admin/connect-google?error=authentication_failed'
      )
    })

    it('redirects to authentication_failed when session is null', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const res = await GET(makeRequest({ code: 'code' }))
      expect(redirectedTo(res)).toBe(
        'http://localhost:9876/admin/connect-google?error=authentication_failed'
      )
    })
  })

  describe('missing tokens', () => {
    it('redirects to missing_tokens when provider_token absent', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: {
          session: {
            provider_token: null,
            provider_refresh_token: 'refresh',
            expires_at: 9999999999,
            user: { email: 'test@example.com' },
          },
        },
        error: null,
      })

      const res = await GET(makeRequest({ code: 'code' }))
      expect(redirectedTo(res)).toBe(
        'http://localhost:9876/admin/connect-google?error=missing_tokens'
      )
    })

    it('redirects to missing_tokens when user email absent', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: {
          session: {
            provider_token: 'access',
            provider_refresh_token: 'refresh',
            expires_at: 9999999999,
            user: { email: null },
          },
        },
        error: null,
      })

      const res = await GET(makeRequest({ code: 'code' }))
      expect(redirectedTo(res)).toBe(
        'http://localhost:9876/admin/connect-google?error=missing_tokens'
      )
    })
  })

  describe('saveGoogleCredentials failure', () => {
    it('redirects to callback_failed when save throws', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: {
          session: {
            provider_token: 'access',
            provider_refresh_token: 'refresh',
            expires_at: 9999999999,
            user: { email: 'test@example.com' },
          },
        },
        error: null,
      })
      mockSaveGoogleCredentials.mockRejectedValue(new Error('DB error'))

      const res = await GET(makeRequest({ code: 'code' }))
      expect(redirectedTo(res)).toBe(
        'http://localhost:9876/admin/connect-google?error=callback_failed'
      )
    })
  })

  describe('success', () => {
    it('saves credentials and redirects with connected=1 and email', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: {
          session: {
            provider_token: 'access-token',
            provider_refresh_token: 'refresh-token',
            expires_at: 9999999999,
            user: { email: 'trillium@example.com' },
          },
        },
        error: null,
      })
      mockSaveGoogleCredentials.mockResolvedValue(undefined)

      const res = await GET(makeRequest({ code: 'good-code' }))

      expect(mockSaveGoogleCredentials).toHaveBeenCalledWith({
        email: 'trillium@example.com',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expiry_date: 9999999999 * 1000,
      })
      expect(redirectedTo(res)).toBe(
        'http://localhost:9876/admin/connect-google?connected=1&email=trillium%40example.com'
      )
    })

    it('uses empty string for refresh_token when absent', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: {
          session: {
            provider_token: 'access-token',
            provider_refresh_token: null,
            expires_at: 9999999999,
            user: { email: 'trillium@example.com' },
          },
        },
        error: null,
      })
      mockSaveGoogleCredentials.mockResolvedValue(undefined)

      await GET(makeRequest({ code: 'code' }))

      expect(mockSaveGoogleCredentials).toHaveBeenCalledWith(
        expect.objectContaining({ refresh_token: '' })
      )
    })
  })
})
