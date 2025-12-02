import posthog from 'posthog-js'

/**
 * Identifies a user in PostHog with custom properties
 * @param userId - The user ID to identify
 * @param properties - Additional properties to set for the user
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function identifyUser(
  userId: string,
  properties: Record<string, unknown> = {}
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if PostHog is disabled
    if (process.env.NEXT_PUBLIC_DISABLE_POSTHOG === 'true') {
      return { success: false, message: 'PostHog is disabled in environment' }
    }

    // Check if PostHog is loaded
    if (!posthog || !posthog.__loaded) {
      return { success: false, message: 'PostHog not loaded' }
    }

    // Check if userId is provided
    if (!userId || userId.trim() === '') {
      return { success: false, message: 'Missing User ID' }
    }

    // Identify the user with PostHog
    posthog.identify(userId, properties)

    return { success: true, message: 'User identified successfully' }
  } catch (error) {
    console.error('[PostHog Error]', error)
    return { success: false, message: 'Error identifying user' }
  }
}

/**
 * Marks a user as a test user in PostHog
 * @param userId - The user ID to mark as test user
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function markUserAsTestUser(
  userId: string
): Promise<{ success: boolean; message: string }> {
  return identifyUser(userId, { test_user: true })
}

/**
 * Captures an event in PostHog
 * @param eventName - The name of the event to capture
 * @param properties - Additional properties to send with the event
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function captureEvent(
  eventName: string,
  properties: Record<string, unknown> = {}
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if PostHog is disabled
    if (process.env.NEXT_PUBLIC_DISABLE_POSTHOG === 'true') {
      return { success: false, message: 'PostHog is disabled in environment' }
    }

    // Check if PostHog is loaded
    if (!posthog || !posthog.__loaded) {
      return { success: false, message: 'PostHog not loaded' }
    }

    // Check if event name is provided
    if (!eventName || eventName.trim() === '') {
      return { success: false, message: 'Missing event name' }
    }

    // Capture the event with PostHog
    posthog.capture(eventName, properties)

    return { success: true, message: 'Event captured successfully' }
  } catch (error) {
    console.error('[PostHog Error]', error)
    return { success: false, message: 'Error capturing event' }
  }
}

/**
 * Gets the current PostHog distinct ID
 * @returns string | null - The distinct ID or null if PostHog is not available
 */
export function getDistinctId(): string | null {
  try {
    if (process.env.NEXT_PUBLIC_DISABLE_POSTHOG === 'true') {
      return 'PostHog is disabled'
    }

    if (typeof window !== 'undefined' && posthog && posthog.__loaded) {
      return posthog.get_distinct_id()
    }

    return 'PostHog not loaded'
  } catch (error) {
    console.error('[PostHog Error]', error)
    return 'Error getting distinct ID'
  }
}

/**
 * Identifies an authenticated user in PostHog with standard properties
 * @param email - The verified email address of the user
 * @param verificationMethod - How the user was verified ('booking_form_submitted' | 'email_verified' | etc.)
 * @param additionalProperties - Optional additional properties to set for the user
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function identifyAuthenticatedUser(
  email: string,
  verificationMethod:
    | 'booking_form_submitted'
    | 'contact_form_submitted'
    | 'email_verified'
    | 'session'
    | 'admin_login'
    | 'admin_session'
    | 'payment_complete'
    | 'newsletter_verified'
    | 'profile_access'
    | 'login'
    | 'action' = 'email_verified',
  additionalProperties: Record<string, unknown> = {}
): Promise<{ success: boolean; message: string }> {
  try {
    if (process.env.NEXT_PUBLIC_DISABLE_POSTHOG === 'true') {
      return { success: false, message: 'PostHog disabled' }
    }

    if (!posthog || !posthog.__loaded) {
      return { success: false, message: 'PostHog not loaded' }
    }

    if (posthog._isIdentified && posthog._isIdentified()) {
      return { success: true, message: 'User already identified' }
    }

    const isAdmin = verificationMethod === 'admin_login' || verificationMethod === 'admin_session'
    const isEmailVerified = verificationMethod === 'email_verified'
    const properties = {
      email,
      verification_method: verificationMethod,
      identified_at: new Date().toISOString(),
      user_type: 'authenticated',
      ...(isAdmin ? { is_admin: true } : {}),
      ...(isEmailVerified ? { email_verified: true } : {}),
      ...additionalProperties,
    }

    posthog.identify(email, properties)
    return { success: true, message: 'User identified' }
  } catch (error) {
    console.error('PostHog identification error:', error)
    return { success: false, message: 'Identification failed' }
  }
}
