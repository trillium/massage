import { UserAuthManager } from '@/lib/userAuth'

/**
 * Generates a secure URL for accessing the my_events page with email verification
 * @param email - The user's email address
 * @param baseUrl - Optional base URL (defaults to current host)
 * @returns Promise<string> - The secure URL with email and token parameters
 */
export async function generateSecureMyEventsUrl(email: string, baseUrl?: string): Promise<string> {
  if (!email || !email.includes('@')) {
    throw new Error('Valid email address is required')
  }

  const host = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return UserAuthManager.generateMyEventsLink(email, host)
}

/**
 * Generates a secure my_events URL for server-side usage
 * @param email - The user's email address
 * @param host - The host URL (required for server-side)
 * @returns Promise<string> - The secure URL with email and token parameters
 */
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

  return UserAuthManager.generateMyEventsLink(email, host)
}

/**
 * Validates if a my_events URL has the correct token for the given email
 * @param url - The URL to validate
 * @returns Promise<boolean> - Whether the URL is valid
 */
export async function validateMyEventsUrl(url: string): Promise<boolean> {
  try {
    const urlObj = new URL(url)
    const email = urlObj.searchParams.get('email')
    const token = urlObj.searchParams.get('token')

    if (!email || !token) {
      return false
    }

    return UserAuthManager.validateUserAccess(email, token)
  } catch (error) {
    console.error('Error validating my_events URL:', error)
    return false
  }
}
