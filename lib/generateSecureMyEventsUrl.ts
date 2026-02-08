import { UserAuthServerManager } from '@/lib/userAuthServer'

export async function generateSecureMyEventsUrlServer(
  email: string,
  host: string
): Promise<string> {
  if (!email || !email.includes('@')) {
    throw new Error('Valid email address is required')
  }

  if (!host) {
    throw new Error('Host URL is required for server-side URL generation')
  }

  return UserAuthServerManager.generateMyEventsLink(email, host)
}
