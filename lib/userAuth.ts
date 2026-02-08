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

  static createSession(email: string, token: string): boolean {
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

  static validateSession(): UserSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY)
      if (!sessionData) return null

      const session: UserSession = JSON.parse(sessionData)

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

  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY)
    } catch (error) {
      console.error('Failed to clear user session:', error)
    }
  }

  static isAuthenticated(): boolean {
    return this.validateSession() !== null
  }

  static getCurrentUserEmail(): string | null {
    const session = this.validateSession()
    return session?.email || null
  }
}
