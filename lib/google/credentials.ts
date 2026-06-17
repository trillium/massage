import { getSupabaseAdminClient, getSupabasePublicAdminClient } from '@/lib/supabase/admin'

export type GoogleOAuthApp = {
  client_id: string
  client_secret: string
}

export type GoogleCredentials = {
  email: string
  access_token: string | null
  refresh_token: string | null
  expiry_date: number | null
}

let cachedCreds: GoogleCredentials | null = null
let cachedApp: GoogleOAuthApp | null = null

export function clearCredentialsCache() {
  cachedCreds = null
}

export function clearAppCache() {
  cachedApp = null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adminClient(): any {
  const supabase = getSupabaseAdminClient()
  if (!supabase) throw new Error('Supabase admin client not available')
  return supabase
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function publicAdminClient(): any {
  const supabase = getSupabasePublicAdminClient()
  if (!supabase) throw new Error('Supabase admin client not available')
  return supabase
}

export async function loadGoogleOAuthApp(): Promise<GoogleOAuthApp | null> {
  if (cachedApp) return cachedApp

  const { data, error } = await publicAdminClient()
    .from('google_oauth_apps')
    .select('client_id, client_secret')
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Failed to load Google OAuth app: ${error.message}`)
  if (!data) return null

  cachedApp = data as GoogleOAuthApp
  return cachedApp
}

export async function loadGoogleCredentials(): Promise<GoogleCredentials | null> {
  if (cachedCreds) return cachedCreds

  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) throw new Error('OWNER_EMAIL not set')

  const { data, error } = await adminClient()
    .from('google_credentials')
    .select('email, access_token, refresh_token, expiry_date')
    .eq('email', ownerEmail)
    .maybeSingle()

  if (error) throw new Error(`Failed to load Google credentials: ${error.message}`)
  if (!data) return null

  cachedCreds = data as GoogleCredentials
  return cachedCreds
}

export async function saveGoogleCredentials(creds: {
  email: string
  refresh_token: string
  access_token?: string | null
  expiry_date?: number | null
}) {
  const { error } = await adminClient()
    .from('google_credentials')
    .upsert(
      {
        email: creds.email,
        refresh_token: creds.refresh_token,
        access_token: creds.access_token ?? null,
        expiry_date: creds.expiry_date ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )

  if (error) throw new Error(`Failed to save Google credentials: ${error.message}`)

  clearCredentialsCache()
}
