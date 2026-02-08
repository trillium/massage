import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UserAuthServerManager } from '@/lib/userAuthServer'

process.env.GOOGLE_OAUTH_SECRET = 'test_secret_for_user_auth'

describe('UserAuthServerManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token Generation and Validation', () => {
    it('should generate a valid signed token', () => {
      const email = 'test@example.com'
      const link = UserAuthServerManager.generateMyEventsLink(email)

      expect(link).toContain('/my_events?email=')
      expect(link).toContain('token=')
      expect(link).toContain(encodeURIComponent(email))
    })

    it('should validate correct token and email combination', () => {
      const email = 'test@example.com'
      const link = UserAuthServerManager.generateMyEventsLink(email)

      const url = new URL(link, 'http://localhost')
      const token = url.searchParams.get('token')
      const urlEmail = url.searchParams.get('email')

      expect(UserAuthServerManager.validateUserAccess(urlEmail, token)).toBe(true)
    })

    it('should reject invalid email-token combination', () => {
      const validEmail = 'test@example.com'
      const link = UserAuthServerManager.generateMyEventsLink(validEmail)

      const url = new URL(link, 'http://localhost')
      const token = url.searchParams.get('token')

      expect(UserAuthServerManager.validateUserAccess('wrong@example.com', token)).toBe(false)
    })

    it('should reject expired tokens', () => {
      const originalDateNow = Date.now
      Date.now = vi.fn(() => 0)

      const email = 'test@example.com'
      const link = UserAuthServerManager.generateMyEventsLink(email)

      const url = new URL(link, 'http://localhost')
      const token = url.searchParams.get('token')

      Date.now = vi.fn(() => 16 * 24 * 60 * 60 * 1000)

      expect(UserAuthServerManager.validateUserAccess(email, token)).toBe(false)

      Date.now = originalDateNow
    })

    it('should reject malformed tokens', () => {
      expect(UserAuthServerManager.validateUserAccess('test@example.com', 'invalid-token')).toBe(
        false
      )
      expect(UserAuthServerManager.validateUserAccess('test@example.com', null)).toBe(false)
      expect(UserAuthServerManager.validateUserAccess(null, 'some-token')).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing environment variables', () => {
      const originalSecret = process.env.GOOGLE_OAUTH_SECRET
      delete process.env.GOOGLE_OAUTH_SECRET

      expect(() => UserAuthServerManager.generateMyEventsLink('test@example.com')).toThrow(
        'GOOGLE_OAUTH_SECRET environment variable is required for user authentication'
      )

      process.env.GOOGLE_OAUTH_SECRET = originalSecret
    })
  })
})
