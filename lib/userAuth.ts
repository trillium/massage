import { hashHmac } from './hash'

export interface UserSession {
  email: string
  token: string
  timestamp: number
  expiresAt: number
}

export const timeValue = 1000 * 60 * 60 * 24 * 30 // 30 days

export class UserAuthManager {
  private static readonly SESSION_KEY = 'user_session'
  private static readonly SESSION_DURATION = timeValue
  private static get TOKEN_SECRET(): string {
    const secret = process.env.GOOGLE_OAUTH_SECRET
    if (!secret) {
      throw new Error(
        'GOOGLE_OAUTH_SECRET environment variable is required for user authentication'
      )
    }
    return secret
  }

  /**
   * Generate a secure my_events link with signed token
   */
  static generateMyEventsLink(email: string, baseUrl: string = ''): string {
    const token = this.generateSignedToken(email)
    return `${baseUrl}/my_events?email=${encodeURIComponent(email)}&token=${token}`
  }

  /**
   * Generate a signed token (simple HMAC for client-side validation)
   */
  private static generateSignedToken(email: string): string {
    const payload = `${email}:${Date.now() + 24 * 60 * 60 * 1000}` // Expires in 24h
    const signature = hashHmac(payload, this.TOKEN_SECRET)
    return btoa(payload + '|' + signature)
  }

  /**
   * Validate signed token client-side
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
   * Validate user access from URL parameters
   */
  static validateUserAccess(email: string | null, token: string | null): boolean {
    if (!email || !token) return false
    return this.validateSignedToken(token, email)
  }

  /**
   * Create and store user session in localStorage after validation
   */
  static createSession(email: string, token: string, skipValidation = false): boolean {
    if (!skipValidation && !this.validateUserAccess(email, token)) return false

    const session: UserSession = {
      email,
      token,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION,
    }

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      return true
    } catch (error) {
      console.error('Failed to create user session:', error)
      return false
    }
  }

  /**
   * Validate existing session from localStorage
   */
  static validateSession(): UserSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY)
      if (!sessionData) return null

      const session: UserSession = JSON.parse(sessionData)

      // Check expiration
      if (Date.now() > session.expiresAt) {
        this.clearSession()
        return null
      }

      return session
    } catch (error) {
      console.error('Failed to validate user session:', error)
      this.clearSession()
      return null
    }
  }

  /**
   * Clear user session
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY)
    } catch (error) {
      console.error('Failed to clear user session:', error)
    }
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return this.validateSession() !== null
  }

  /**
   * Get current user email if authenticated
   */
  static getCurrentUserEmail(): string | null {
    const session = this.validateSession()
    return session?.email || null
  }
}
