import { createServerClient } from '@supabase/ssr'
import type { Database } from './database.types'

const tenantSchema = (process.env.TENANT_SLUG || 'public') as 'public'

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  return createServerClient<Database>(url, key, {
    db: { schema: tenantSchema },
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })
}
