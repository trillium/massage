import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/supabase/server'
import { saveGoogleCredentials } from '@/lib/google/credentials'

interface TokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  error?: string
}

interface UserInfoResponse {
  email?: string
  error?: string
}

async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    client_secret: process.env.GOOGLE_OAUTH_SECRET!,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  return response.json()
}

async function fetchUserEmail(accessToken: string): Promise<string> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const data: UserInfoResponse = await response.json()
  if (!data.email) throw new Error('Could not retrieve user email from Google')
  return data.email
}

export async function GET(request: NextRequest) {
  const adminUser = await isAdmin()
  if (!adminUser) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/admin`)
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    const reason = error ?? 'missing_code'
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/admin/connect-google?error=${reason}`
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const redirectUri = `${siteUrl}/api/auth/google/callback`

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri)

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error(`Token exchange failed: ${JSON.stringify(tokens)}`)
    }

    const email = await fetchUserEmail(tokens.access_token)
    const expiryDate = Date.now() + (tokens.expires_in ?? 3600) * 1000

    await saveGoogleCredentials({
      email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: expiryDate,
    })

    return NextResponse.redirect(
      `${siteUrl}/admin/connect-google?success=true&email=${encodeURIComponent(email)}`
    )
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return NextResponse.redirect(`${siteUrl}/admin/connect-google?error=callback_failed`)
  }
}
