import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export class AdminFetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AdminFetchError'
  }
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new AdminFetchError('No active admin session')
  }

  return fetch(input, {
    ...init,
    credentials: 'same-origin',
  })
}
