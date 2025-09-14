import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import getGmailAccessToken from '@/lib/gmail/getGmailAccessToken'

const originalFetch = global.fetch

describe('getGmailAccessToken', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    // Clear environment variables for each test
    delete process.env.GOOGLE_OAUTH_SECRET
    delete process.env.GOOGLE_OAUTH_REFRESH
    delete process.env.GOOGLE_OAUTH_CLIENT_ID
  })

  afterEach(() => {
    global.fetch = originalFetch
    delete process.env.GOOGLE_OAUTH_SECRET
    delete process.env.GOOGLE_OAUTH_REFRESH
    delete process.env.GOOGLE_OAUTH_CLIENT_ID
  })

  it('throws an error if GOOGLE_OAUTH_SECRET is not set', async () => {
    await expect(getGmailAccessToken()).rejects.toThrow('GOOGLE_OAUTH_SECRET not set')
  })

  it('throws an error if GOOGLE_OAUTH_REFRESH is not set', async () => {
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'

    await expect(getGmailAccessToken()).rejects.toThrow('GOOGLE_OAUTH_REFRESH not set')
  })

  it('throws an error if GOOGLE_OAUTH_CLIENT_ID is not set', async () => {
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'
    process.env.GOOGLE_OAUTH_REFRESH = 'test_refresh'

    await expect(getGmailAccessToken()).rejects.toThrow('GOOGLE_OAUTH_CLIENT_ID not set')
  })

  it('successfully retrieves a Gmail access token', async () => {
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'
    process.env.GOOGLE_OAUTH_REFRESH = 'test_refresh'
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'test_client_id'

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
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'
    process.env.GOOGLE_OAUTH_REFRESH = 'test_refresh'
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'test_client_id'

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
    process.env.GOOGLE_OAUTH_SECRET = 'secret_123'
    process.env.GOOGLE_OAUTH_REFRESH = 'refresh_456'
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'client_789'

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
