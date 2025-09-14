import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AdminAuthManager } from '../adminAuth'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock environment variable
const originalEnv = process.env
beforeEach(() => {
  vi.resetAllMocks()
  process.env = { ...originalEnv, GOOGLE_OAUTH_SECRET: 'test_secret_key' }
  localStorageMock.getItem.mockReturnValue(null)
  localStorageMock.setItem.mockReturnValue(undefined)
  localStorageMock.removeItem.mockReturnValue(undefined)
})

afterEach(() => {
  process.env = originalEnv
})

describe('AdminAuthManager', () => {
  describe('generateAdminLink', () => {
    it('should generate a secure admin link with token', () => {
      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email)

      expect(link).toContain('/admin?email=')
      expect(link).toContain('token=')
      expect(link).toContain(encodeURIComponent(email))
    })

    it('should use custom base URL when provided', () => {
      const email = 'admin@example.com'
      const baseUrl = 'https://example.com'
      const link = AdminAuthManager.generateAdminLink(email, baseUrl)

      expect(link).toContain(`${baseUrl}/admin?email=${encodeURIComponent(email)}&token=`)
      expect(link).toContain('token=')
    })
  })

  describe('validateAdminAccess', () => {
    it('should validate correct email and token combination', () => {
      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email, 'https://example.com')
      const url = new URL(link)
      const token = url.searchParams.get('token')

      const isValid = AdminAuthManager.validateAdminAccess(email, token)
      expect(isValid).toBe(true)
    })

    it('should reject null email', () => {
      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email, 'https://example.com')
      const url = new URL(link)
      const token = url.searchParams.get('token')

      const isValid = AdminAuthManager.validateAdminAccess(null, token)
      expect(isValid).toBe(false)
    })

    it('should reject null token', () => {
      const isValid = AdminAuthManager.validateAdminAccess('admin@example.com', null)
      expect(isValid).toBe(false)
    })

    it('should reject both null email and token', () => {
      const isValid = AdminAuthManager.validateAdminAccess(null, null)
      expect(isValid).toBe(false)
    })

    it('should reject token with wrong email', () => {
      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email, 'https://example.com')
      const url = new URL(link)
      const token = url.searchParams.get('token')

      const isValid = AdminAuthManager.validateAdminAccess('wrong@example.com', token)
      expect(isValid).toBe(false)
    })

    it('should reject tampered token', () => {
      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email, 'https://example.com')
      const url = new URL(link)
      let token = url.searchParams.get('token')

      // Tamper with the token
      if (token) {
        token = token.replace('a', 'b')
      }

      const isValid = AdminAuthManager.validateAdminAccess(email, token)
      expect(isValid).toBe(false)
    })

    it('should reject malformed token', () => {
      const isValid = AdminAuthManager.validateAdminAccess('admin@example.com', 'invalid-token')
      expect(isValid).toBe(false)
    })
  })

  describe('createSession', () => {
    it('should create session with valid credentials', () => {
      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email, 'https://example.com')
      const url = new URL(link)
      const token = url.searchParams.get('token')

      const result = AdminAuthManager.createSession(email, token)

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)

      const [key, value] = localStorageMock.setItem.mock.calls[0]
      expect(key).toBe('admin_session')

      const session = JSON.parse(value)
      expect(session.email).toBe(email)
      expect(session.token).toBe(token)
      expect(session.timestamp).toBeDefined()
      expect(session.expiresAt).toBeDefined()
    })

    it('should reject invalid credentials', () => {
      const result = AdminAuthManager.createSession('admin@example.com', 'invalid-token')
      expect(result).toBe(false)
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email, 'https://example.com')
      const url = new URL(link)
      const token = url.searchParams.get('token')

      const result = AdminAuthManager.createSession(email, token)
      expect(result).toBe(false)
    })
  })

  describe('createValidatedSession', () => {
    it('should create session without validation when skipValidation is true', () => {
      const email = 'admin@example.com'
      const token = 'test-token'

      const result = AdminAuthManager.createValidatedSession(email, token)

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)

      const [key, value] = localStorageMock.setItem.mock.calls[0]
      expect(key).toBe('admin_session')

      const session = JSON.parse(value)
      expect(session.email).toBe(email)
      expect(session.token).toBe(token)
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = AdminAuthManager.createValidatedSession('admin@example.com', 'test-token')
      expect(result).toBe(false)
    })
  })

  describe('validateSession', () => {
    it('should return valid session', () => {
      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email, 'https://example.com')
      const url = new URL(link)
      const token = url.searchParams.get('token')

      const sessionData = {
        email,
        token,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const session = AdminAuthManager.validateSession()
      expect(session).toEqual(sessionData)
    })

    it('should return null for expired session', () => {
      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email, 'https://example.com')
      const url = new URL(link)
      const token = url.searchParams.get('token')

      const sessionData = {
        email,
        token,
        timestamp: Date.now(),
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const session = AdminAuthManager.validateSession()
      expect(session).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_session')
    })

    it('should return null when no session exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const session = AdminAuthManager.validateSession()
      expect(session).toBeNull()
    })

    it('should handle corrupted session data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const session = AdminAuthManager.validateSession()
      expect(session).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_session')
    })
  })

  describe('clearSession', () => {
    it('should clear session from localStorage', () => {
      AdminAuthManager.clearSession()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_session')
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw
      expect(() => AdminAuthManager.clearSession()).not.toThrow()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when session is valid', () => {
      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email, 'https://example.com')
      const url = new URL(link)
      const token = url.searchParams.get('token')

      const sessionData = {
        email,
        token,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const isAuthenticated = AdminAuthManager.isAuthenticated()
      expect(isAuthenticated).toBe(true)
    })

    it('should return false when no valid session', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const isAuthenticated = AdminAuthManager.isAuthenticated()
      expect(isAuthenticated).toBe(false)
    })
  })

  describe('getCurrentAdminEmail', () => {
    it('should return email when authenticated', () => {
      const email = 'admin@example.com'
      const link = AdminAuthManager.generateAdminLink(email, 'https://example.com')
      const url = new URL(link)
      const token = url.searchParams.get('token')

      const sessionData = {
        email,
        token,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const currentEmail = AdminAuthManager.getCurrentAdminEmail()
      expect(currentEmail).toBe(email)
    })

    it('should return null when not authenticated', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const currentEmail = AdminAuthManager.getCurrentAdminEmail()
      expect(currentEmail).toBeNull()
    })
  })

  describe('error handling', () => {
    it('should throw error when GOOGLE_OAUTH_SECRET is not set', () => {
      delete process.env.GOOGLE_OAUTH_SECRET

      expect(() => AdminAuthManager.generateAdminLink('admin@example.com')).toThrow(
        'GOOGLE_OAUTH_SECRET environment variable is required for admin authentication'
      )
    })
  })
})
