import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export type GoogleCredentials = {
  email: string
  access_token: string | null
  refresh_token: string | null
  expiry_date: number | null
}

let cachedCreds: GoogleCredentials | null = null

export function clearCredentialsCache() {
  cachedCreds = null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adminClient(): any {
  const supabase = getSupabaseAdminClient()
  if (!supabase) throw new Error('Supabase admin client not available')
  return supabase
}

export async function loadGoogleCredentials(): Promise<GoogleCredentials> {
  if (cachedCreds) return cachedCreds

  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) throw new Error('OWNER_EMAIL not set')

  const { data, error } = await adminClient()
    .from('google_credentials')
    .select('email, access_token, refresh_token, expiry_date')
    .eq('email', ownerEmail)
    .single()

  if (error || !data) {
    throw new Error(`Failed to load Google credentials: ${error?.message ?? 'not found'}`)
  }

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
