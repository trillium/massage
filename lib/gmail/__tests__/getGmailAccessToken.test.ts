import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import getGmailAccessToken from '@/lib/gmail/getGmailAccessToken'

vi.mock('@/lib/google/credentials', () => ({
  loadGoogleCredentials: vi.fn(),
  loadGoogleOAuthApp: vi.fn(),
}))

import { loadGoogleCredentials, loadGoogleOAuthApp } from '@/lib/google/credentials'

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

describe('getGmailAccessToken', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.mocked(loadGoogleCredentials).mockResolvedValue(validCreds)
    vi.mocked(loadGoogleOAuthApp).mockResolvedValue(validApp)
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('throws if no refresh token is available', async () => {
    vi.mocked(loadGoogleCredentials).mockResolvedValueOnce({
      ...validCreds,
      refresh_token: null,
    })
    await expect(getGmailAccessToken()).rejects.toThrow('No Google refresh token available')
  })

  it('throws if Google OAuth app is not configured', async () => {
    vi.mocked(loadGoogleOAuthApp).mockResolvedValueOnce(null)
    await expect(getGmailAccessToken()).rejects.toThrow('Google OAuth app not configured')
  })

  it('successfully retrieves a Gmail access token', async () => {
    const accessToken = 'test_gmail_access_token'
    const mockJson = {
      access_token: accessToken,
      scope:
        'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly',
    }
    const mockResponse = new Response(JSON.stringify(mockJson), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

    ;(fetch as Mock).mockResolvedValueOnce(mockResponse)

    const result = await getGmailAccessToken()

    expect(result).toStrictEqual(accessToken)
    expect(fetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: expect.stringContaining('grant_type=refresh_token'),
        cache: 'no-cache',
      })
    )
  })

  it('throws an error if access_token is not in the response', async () => {
    const mockJson = { error: 'invalid_grant' }
    const mockResponse = new Response(JSON.stringify(mockJson), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })

    ;(fetch as Mock).mockResolvedValueOnce(mockResponse)

    await expect(getGmailAccessToken()).rejects.toMatchObject({
      message: expect.stringMatching(/Couldn't get Gmail access token/),
    })
  })

  it('includes correct request parameters', async () => {
    vi.mocked(loadGoogleCredentials).mockResolvedValueOnce({
      ...validCreds,
      refresh_token: 'refresh_456',
    })
    vi.mocked(loadGoogleOAuthApp).mockResolvedValueOnce({
      ...validApp,
      client_id: 'client_789',
      client_secret: 'secret_123',
    })

    const mockJson = { access_token: 'token_abc' }
    const mockResponse = new Response(JSON.stringify(mockJson), { status: 200 })

    ;(fetch as Mock).mockResolvedValueOnce(mockResponse)

    await getGmailAccessToken()

    const fetchCall = (fetch as Mock).mock.calls[0]
    const requestBody = fetchCall[1].body

    expect(requestBody).toContain('grant_type=refresh_token')
    expect(requestBody).toContain('client_secret=secret_123')
    expect(requestBody).toContain('refresh_token=refresh_456')
    expect(requestBody).toContain('client_id=client_789')
  })
})
