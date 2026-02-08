import { hashHmac } from './hash'

export class UserAuthServerManager {
  private static get TOKEN_SECRET(): string {
    const secret = process.env.GOOGLE_OAUTH_SECRET
    if (!secret) {
      throw new Error(
        'GOOGLE_OAUTH_SECRET environment variable is required for user authentication'
      )
    }
    return secret
  }

  static generateMyEventsLink(email: string, baseUrl: string = ''): string {
    const token = this.generateSignedToken(email)
    return `${baseUrl}/my_events?email=${encodeURIComponent(email)}&token=${token}`
  }

  static generateSignedToken(email: string): string {
    const payload = `${email}:${Date.now() + 15 * 24 * 60 * 60 * 1000}`
    const signature = hashHmac(payload, this.TOKEN_SECRET)
    return btoa(payload + '|' + signature)
  }

  static validateSignedToken(token: string, email: string): boolean {
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

  static validateUserAccess(email: string | null, token: string | null): boolean {
    if (!email || !token) return false
    return this.validateSignedToken(token, email)
  }
}
