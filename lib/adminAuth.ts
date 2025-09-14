import { hashHmac } from './hash'

export interface AdminSession {
  email: string
  token: string
  timestamp: number
  expiresAt: number
}

export const timeValue = 1000 * 60 * 60 * 24 * 30 // 30 days

export class AdminAuthManager {
  private static readonly SESSION_KEY = 'admin_session'
  private static readonly SESSION_DURATION = timeValue
  private static get TOKEN_SECRET(): string {
    const secret = process.env.GOOGLE_OAUTH_SECRET
    if (!secret) {
      throw new Error(
        'GOOGLE_OAUTH_SECRET environment variable is required for admin authentication'
      )
    }
    return secret
  }

  /**
   * Generate a secure admin login link with signed token
   */
  static generateAdminLink(email: string, baseUrl: string = ''): string {
    const token = this.generateSignedToken(email)
    return `${baseUrl}/admin?email=${encodeURIComponent(email)}&token=${token}`
  }

  /**
   * Generate a signed token (HMAC for server-side validation)
   */
  private static generateSignedToken(email: string): string {
    const payload = `${email}:${Date.now() + 15 * 24 * 60 * 60 * 1000}` // Expires in 15 days
    const signature = hashHmac(payload, this.TOKEN_SECRET)
    return btoa(payload + '|' + signature)
  }

  /**
   * Validate signed token server-side
   */
  private static validateSignedToken(token: string, email: string): boolean {
    try {
      const decoded = atob(token)
      const [payload, signature] = decoded.split('|')
      const expectedSig = hashHmac(payload, this.TOKEN_SECRET)
      if (signature !== expectedSig) return false
      const [tokenEmail, expires] = payload.split(':')
      return tokenEmail === email && Date.now() < parseInt(expires)
    } catch {
      return false
    }
  }

  /**
   * Validate admin access from URL parameters
   */
  static validateAdminAccess(email: string | null, token: string | null): boolean {
    if (!email || !token) return false
    return this.validateSignedToken(token, email)
  }

  /**
   * Create and store admin session in localStorage
   */
  static createSession(email: string, token: string): boolean {
    if (!this.validateAdminAccess(email, token)) return false

    const session: AdminSession = {
      email,
      token,
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
  static createValidatedSession(email: string, token: string): boolean {
    const session: AdminSession = {
      email,
      token,
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
