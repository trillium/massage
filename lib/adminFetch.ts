import { AdminAuthManager } from '@/lib/adminAuth'

export class AdminFetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AdminFetchError'
  }
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const session = AdminAuthManager.validateSession()
  if (!session) {
    throw new AdminFetchError('No active admin session')
  }

  const headers = new Headers(init?.headers)
  headers.set('x-admin-email', session.email)
  headers.set('x-admin-token', session.token)

  return fetch(input, {
    ...init,
    headers,
  })
}
