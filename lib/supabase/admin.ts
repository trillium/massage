import { createServerClient } from '@supabase/ssr'
import type { Database } from './database.types'

const tenantSchema = (process.env.TENANT_SLUG || 'public') as 'public'

function makeAdminClient(schema: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  return createServerClient<Database>(url, key, {
    db: { schema: schema as 'public' },
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })
}

export function getSupabaseAdminClient() {
  return makeAdminClient(tenantSchema)
}

export function getSupabasePublicAdminClient() {
  return makeAdminClient('public')
}
