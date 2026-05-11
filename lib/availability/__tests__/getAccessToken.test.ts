import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import getAccessToken, { clearTokenCache } from '@/lib/availability/getAccessToken'

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

vi.mock('@/lib/google/credentials', () => ({
  loadGoogleCredentials: vi.fn(),
  clearCredentialsCache: vi.fn(),
  loadGoogleOAuthApp: vi.fn(),
}))

import {
  loadGoogleCredentials,
  clearCredentialsCache,
  loadGoogleOAuthApp,
} from '@/lib/google/credentials'

const originalFetch = global.fetch

const validCreds = {
  email: 'test@example.com',
  access_token: null,
  refresh_token: 'test_refresh',
  expiry_date: null,
  oauth_app_id: null,
}

const validApp = {
  id: 'app-uuid',
  name: 'test_app',
  client_id: 'test_client_id',
  client_secret: 'test_secret',
}

describe('getAccessToken', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    clearTokenCache()
    vi.mocked(loadGoogleCredentials).mockResolvedValue(validCreds)
    vi.mocked(loadGoogleOAuthApp).mockResolvedValue(validApp)
    vi.mocked(clearCredentialsCache).mockClear()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('throws if Google OAuth app is not configured', async () => {
    vi.mocked(loadGoogleOAuthApp).mockResolvedValueOnce(null)
    await expect(getAccessToken()).rejects.toThrow('Google OAuth app not configured')
  })

  it('successfully retrieves an access token', async () => {
    const mockResponse = new Response(JSON.stringify({ access_token: 'test_access_token' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    ;(fetch as Mock).mockResolvedValueOnce(mockResponse)

    const result = await getAccessToken()
    expect(result).toBe('test_access_token')
  })

  it('retries with cleared cache when token exchange fails', async () => {
    const failResponse = new Response(JSON.stringify({ error: 'invalid_grant' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
    const successResponse = new Response(JSON.stringify({ access_token: 'refreshed_token' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    ;(fetch as Mock).mockResolvedValueOnce(failResponse).mockResolvedValueOnce(successResponse)

    const result = await getAccessToken()
    expect(result).toBe('refreshed_token')
    expect(clearCredentialsCache).toHaveBeenCalled()
  })

  it('throws after retry still fails', async () => {
    const failResponse1 = new Response(JSON.stringify({ error: 'invalid_grant' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
    const failResponse2 = new Response(JSON.stringify({ error: 'invalid_grant' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
    ;(fetch as Mock).mockResolvedValueOnce(failResponse1).mockResolvedValueOnce(failResponse2)

    await expect(getAccessToken()).rejects.toThrow(
      'Failed to get access token after credential cache refresh'
    )
  })

  it('in-process cache prevents second fetch call within TTL', async () => {
    const mockResponse = new Response(JSON.stringify({ access_token: 'cached_token' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    ;(fetch as Mock).mockResolvedValue(mockResponse)

    const first = await getAccessToken()
    const second = await getAccessToken()

    expect(first).toBe('cached_token')
    expect(second).toBe('cached_token')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
