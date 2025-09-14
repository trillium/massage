import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UserAuthManager } from '@/lib/userAuth'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock environment variables
process.env.GOOGLE_OAUTH_SECRET = 'test_secret_for_user_auth'

describe('UserAuthManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockReturnValue(undefined)
    localStorageMock.removeItem.mockReturnValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token Generation and Validation', () => {
    it('should generate a valid signed token', () => {
      const email = 'test@example.com'
      const link = UserAuthManager.generateMyEventsLink(email)

      expect(link).toContain('/my_events?email=')
      expect(link).toContain('token=')
      expect(link).toContain(encodeURIComponent(email))
    })

    it('should validate correct token and email combination', () => {
      const email = 'test@example.com'
      const link = UserAuthManager.generateMyEventsLink(email)

      // Extract token from link
      const url = new URL(link, 'http://localhost')
      const token = url.searchParams.get('token')
      const urlEmail = url.searchParams.get('email')

      expect(UserAuthManager.validateUserAccess(urlEmail, token)).toBe(true)
    })

    it('should reject invalid email-token combination', () => {
      const validEmail = 'test@example.com'
      const link = UserAuthManager.generateMyEventsLink(validEmail)

      // Extract token from link
      const url = new URL(link, 'http://localhost')
      const token = url.searchParams.get('token')

      // Try with wrong email
      expect(UserAuthManager.validateUserAccess('wrong@example.com', token)).toBe(false)
    })

    it('should reject expired tokens', () => {
      // Create a token that expires immediately by mocking Date.now
      const originalDateNow = Date.now
      Date.now = vi.fn(() => 0) // Very old timestamp

      const email = 'test@example.com'
      const link = UserAuthManager.generateMyEventsLink(email)

      // Extract token
      const url = new URL(link, 'http://localhost')
      const token = url.searchParams.get('token')

      // Restore Date.now and advance time past expiration
      Date.now = vi.fn(() => 16 * 24 * 60 * 60 * 1000) // 16 days later (past 15 day expiration)

      expect(UserAuthManager.validateUserAccess(email, token)).toBe(false)

      // Restore original Date.now
      Date.now = originalDateNow
    })

    it('should reject malformed tokens', () => {
      expect(UserAuthManager.validateUserAccess('test@example.com', 'invalid-token')).toBe(false)
      expect(UserAuthManager.validateUserAccess('test@example.com', null)).toBe(false)
      expect(UserAuthManager.validateUserAccess(null, 'some-token')).toBe(false)
    })
  })

  describe('Session Management', () => {
    it('should create and store user session', () => {
      const email = 'test@example.com'
      const link = UserAuthManager.generateMyEventsLink(email)
      const url = new URL(link, 'http://localhost')
      const token = url.searchParams.get('token')

      const result = UserAuthManager.createSession(email, token!)

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user_session',
        expect.stringContaining(email)
      )
    })

    it('should validate existing session', () => {
      const mockSession = {
        email: 'test@example.com',
        token: 'valid-token',
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))

      const session = UserAuthManager.validateSession()

      expect(session).toEqual(mockSession)
    })

    it('should return null for expired session', () => {
      const mockSession = {
        email: 'test@example.com',
        token: 'valid-token',
        timestamp: Date.now() - 31 * 24 * 60 * 60 * 1000, // 31 days ago
        expiresAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))

      const session = UserAuthManager.validateSession()

      expect(session).toBe(null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_session')
    })

    it('should return null for malformed session data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const session = UserAuthManager.validateSession()

      expect(session).toBe(null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_session')
    })

    it('should clear session', () => {
      UserAuthManager.clearSession()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_session')
    })

    it('should check authentication status', () => {
      // No session
      localStorageMock.getItem.mockReturnValue(null)
      expect(UserAuthManager.isAuthenticated()).toBe(false)

      // Valid session
      const mockSession = {
        email: 'test@example.com',
        token: 'valid-token',
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))
      expect(UserAuthManager.isAuthenticated()).toBe(true)
    })

    it('should get current user email', () => {
      // No session
      localStorageMock.getItem.mockReturnValue(null)
      expect(UserAuthManager.getCurrentUserEmail()).toBe(null)

      // Valid session
      const mockSession = {
        email: 'test@example.com',
        token: 'valid-token',
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))
      expect(UserAuthManager.getCurrentUserEmail()).toBe('test@example.com')
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const email = 'test@example.com'
      const link = UserAuthManager.generateMyEventsLink(email)
      const url = new URL(link, 'http://localhost')
      const token = url.searchParams.get('token')

      const result = UserAuthManager.createSession(email, token!)

      expect(result).toBe(false)
    })

    it('should handle missing environment variables', () => {
      const originalSecret = process.env.GOOGLE_OAUTH_SECRET
      delete process.env.GOOGLE_OAUTH_SECRET

      expect(() => UserAuthManager.generateMyEventsLink('test@example.com')).toThrow(
        'GOOGLE_OAUTH_SECRET environment variable is required for user authentication'
      )

      process.env.GOOGLE_OAUTH_SECRET = originalSecret
    })
  })
})
