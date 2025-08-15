import { getHash } from '@/lib/hash'

/**
 * Generates a secure URL for accessing the my_events page with email verification
 * @param email - The user's email address
 * @param baseUrl - Optional base URL (defaults to current host)
 * @returns Promise<string> - The secure URL with email and hash parameters
 */
export async function generateSecureMyEventsUrl(email: string, baseUrl?: string): Promise<string> {
  if (!email || !email.includes('@')) {
    throw new Error('Valid email address is required')
  }

  const hash = await getHash(email)
  const host = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')

  const params = new URLSearchParams({
    email,
    hash,
  })

  return `${host}/my_events?${params.toString()}`
}

/**
 * Generates a secure my_events URL for server-side usage
 * @param email - The user's email address
 * @param host - The host URL (required for server-side)
 * @returns Promise<string> - The secure URL with email and hash parameters
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

  const hash = await getHash(email)

  const params = new URLSearchParams({
    email,
    hash,
  })

  return `${host}/my_events?${params.toString()}`
}

/**
 * Validates if a my_events URL has the correct hash for the given email
 * @param url - The URL to validate
 * @returns Promise<boolean> - Whether the URL is valid
 */
export async function validateMyEventsUrl(url: string): Promise<boolean> {
  try {
    const urlObj = new URL(url)
    const email = urlObj.searchParams.get('email')
    const hash = urlObj.searchParams.get('hash')

    if (!email || !hash) {
      return false
    }

    const expectedHash = await getHash(email)
    return expectedHash === hash
  } catch (error) {
    console.error('Error validating my_events URL:', error)
    return false
  }
}
