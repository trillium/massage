import { loadGoogleCredentials, loadGoogleOAuthApp } from '@/lib/google/credentials'

export default async function getGmailAccessToken(): Promise<string> {
  const [creds, app] = await Promise.all([loadGoogleCredentials(), loadGoogleOAuthApp()])

  if (!creds?.refresh_token) throw new Error('No Google refresh token available')
  if (!app) throw new Error('Google OAuth app not configured')

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_secret: app.client_secret,
    refresh_token: creds.refresh_token,
    client_id: app.client_id,
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
