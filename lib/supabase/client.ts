/**
 * Supabase Browser Client
 *
 * Use this in Client Components (components with 'use client')
 * This client handles auth state and manages sessions in the browser.
 */

'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  client = createBrowserClient<Database>(url, key)
  return client
}
