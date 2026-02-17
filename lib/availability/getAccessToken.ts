const TOKEN_CACHE_MS = 50 * 60 * 1000
let cachedToken: { value: string; expiresAt: number } | null = null

export function clearTokenCache() {
  cachedToken = null
}

export default async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value
  }

  if (!process.env.GOOGLE_OAUTH_SECRET) {
    throw new Error('GOOGLE_OAUTH_SECRET not set')
  }
  if (!process.env.GOOGLE_OAUTH_REFRESH) {
    throw new Error('GOOGLE_OAUTH_REFRESH not set')
  }
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID not set')
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_secret: process.env.GOOGLE_OAUTH_SECRET,
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH,
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

  if (!json.access_token) {
    throw new Error(`Couldn't get access token: ${JSON.stringify(json, null, 2)}`)
  }

  cachedToken = {
    value: json.access_token as string,
    expiresAt: Date.now() + TOKEN_CACHE_MS,
  }

  return cachedToken.value
}
