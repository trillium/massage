import { loadGoogleCredentials } from '@/lib/google/credentials'

async function getRefreshToken(): Promise<string> {
  const creds = await loadGoogleCredentials()
  if (creds?.refresh_token) return creds.refresh_token
  if (process.env.GOOGLE_OAUTH_REFRESH) return process.env.GOOGLE_OAUTH_REFRESH
  throw new Error('No Google refresh token available')
}

export default async function getGmailAccessToken(): Promise<string> {
  if (!process.env.GOOGLE_OAUTH_SECRET) {
    throw new Error('GOOGLE_OAUTH_SECRET not set')
  }
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID not set')
  }

  const refreshToken = await getRefreshToken()

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_secret: process.env.GOOGLE_OAUTH_SECRET,
    refresh_token: refreshToken,
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
    throw new Error(`Couldn't get Gmail access token: ${JSON.stringify(json, null, 2)}`)
  }

  return json.access_token as string
}
