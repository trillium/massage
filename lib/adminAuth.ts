import { getHash } from './hash'

export interface AdminSession {
  email: string
  hash: string
  timestamp: number
  expiresAt: number
}

export const timeValue = 1000 * 60 * 60 * 24 * 30 // 30 days

export class AdminAuthManager {
  private static readonly SESSION_KEY = 'admin_session'
  private static readonly SESSION_DURATION = timeValue

  /**
   * Generate a secure admin login link
   */
  static generateAdminLink(email: string, baseUrl: string = ''): string {
    const hash = getHash(email)
    return `${baseUrl}/admin?email=${encodeURIComponent(email)}&hash=${hash}`
  }

  /**
   * Validate admin access from URL parameters
   */
  static validateAdminAccess(email: string | null, hash: string | null): boolean {
    if (!email || !hash) return false

    const expectedHash = getHash(email)
    return expectedHash === hash
  }

  /**
   * Create and store admin session in localStorage
   */
  static createSession(email: string, hash: string): boolean {
    if (!this.validateAdminAccess(email, hash)) return false

    const session: AdminSession = {
      email,
      hash,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION,
    }

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      return true
    } catch (error) {
      console.error('Failed to create admin session:', error)
      return false
    }
  }

  /**
   * Create and store admin session in localStorage after server-side validation
   * Use this when you've already validated the credentials server-side
   */
  static createValidatedSession(email: string, hash: string): boolean {
    const session: AdminSession = {
      email,
      hash,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION,
    }

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      return true
    } catch (error) {
      console.error('Failed to create admin session:', error)
      return false
    }
  }

  /**
   * Validate existing session from localStorage
   */
  static validateSession(): AdminSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY)
      if (!sessionData) return null

      const session: AdminSession = JSON.parse(sessionData)

      // Check expiration
      if (Date.now() > session.expiresAt) {
        this.clearSession()
        return null
      }

      // For existing sessions, we trust that the hash was validated server-side
      // when the session was created, so we don't re-validate it client-side
      return session
    } catch (error) {
      console.error('Failed to validate admin session:', error)
      this.clearSession()
      return null
    }
  }

  /**
   * Clear admin session
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY)
    } catch (error) {
      console.error('Failed to clear admin session:', error)
    }
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return this.validateSession() !== null
  }

  /**
   * Get current admin email if authenticated
   */
  static getCurrentAdminEmail(): string | null {
    const session = this.validateSession()
    return session?.email || null
  }
}
