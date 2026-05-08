import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import getAccessToken, { clearTokenCache } from '@/lib/availability/getAccessToken'

vi.mock('@/lib/google/credentials', () => ({
  loadGoogleCredentials: vi.fn(),
  clearCredentialsCache: vi.fn(),
}))

import { loadGoogleCredentials, clearCredentialsCache } from '@/lib/google/credentials'

const originalFetch = global.fetch

const validCreds = {
  email: 'test@example.com',
  access_token: null,
  refresh_token: 'test_refresh',
  expiry_date: null,
}

describe('getAccessToken', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    clearTokenCache()
    vi.mocked(loadGoogleCredentials).mockResolvedValue(validCreds)
    vi.mocked(clearCredentialsCache).mockClear()
    delete process.env.GOOGLE_OAUTH_SECRET
    delete process.env.GOOGLE_OAUTH_CLIENT_ID
  })

  afterEach(() => {
    global.fetch = originalFetch
    delete process.env.GOOGLE_OAUTH_SECRET
    delete process.env.GOOGLE_OAUTH_CLIENT_ID
  })

  it('throws if GOOGLE_OAUTH_SECRET is not set', async () => {
    await expect(getAccessToken()).rejects.toThrow('GOOGLE_OAUTH_SECRET not set')
  })

  it('throws if GOOGLE_OAUTH_CLIENT_ID is not set', async () => {
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'
    await expect(getAccessToken()).rejects.toThrow('GOOGLE_OAUTH_CLIENT_ID not set')
  })

  it('successfully retrieves an access token', async () => {
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'test_client_id'

    const mockResponse = new Response(JSON.stringify({ access_token: 'test_access_token' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    ;(fetch as Mock).mockResolvedValueOnce(mockResponse)

    const result = await getAccessToken()
    expect(result).toBe('test_access_token')
  })

  it('retries with cleared cache when token exchange fails', async () => {
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'test_client_id'

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
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'test_client_id'

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
})
