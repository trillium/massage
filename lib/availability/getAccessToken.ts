import { clearCredentialsCache, loadGoogleCredentials } from '@/lib/google/credentials'

const TOKEN_CACHE_MS = 50 * 60 * 1000
let cachedToken: { value: string; expiresAt: number } | null = null

export function clearTokenCache() {
  cachedToken = null
}

async function exchangeRefreshToken(): Promise<string | null> {
  const creds = await loadGoogleCredentials()

  if (!creds.refresh_token) return null
  if (!process.env.GOOGLE_OAUTH_SECRET) throw new Error('GOOGLE_OAUTH_SECRET not set')
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) throw new Error('GOOGLE_OAUTH_CLIENT_ID not set')

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_secret: process.env.GOOGLE_OAUTH_SECRET,
    refresh_token: creds.refresh_token,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    cache: 'no-cache',
  })

  const json = await response.json()
  return (json.access_token as string) ?? null
}

export default async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value
  }

  let accessToken = await exchangeRefreshToken()

  if (!accessToken) {
    clearCredentialsCache()
    accessToken = await exchangeRefreshToken()
  }

  if (!accessToken) {
    throw new Error('Failed to get access token after credential cache refresh')
  }

  cachedToken = {
    value: accessToken,
    expiresAt: Date.now() + TOKEN_CACHE_MS,
  }

  return cachedToken.value
}
