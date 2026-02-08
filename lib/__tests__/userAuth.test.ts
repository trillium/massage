import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UserAuthManager } from '@/lib/userAuth'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

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

  describe('Session Management', () => {
    it('should create and store user session', () => {
      const result = UserAuthManager.createSession('test@example.com', 'some-token')

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user_session',
        expect.stringContaining('test@example.com')
      )
    })

    it('should validate existing session', () => {
      const mockSession = {
        email: 'test@example.com',
        token: 'valid-token',
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))

      const session = UserAuthManager.validateSession()

      expect(session).toEqual(mockSession)
    })

    it('should return null for expired session', () => {
      const mockSession = {
        email: 'test@example.com',
        token: 'valid-token',
        timestamp: Date.now() - 31 * 24 * 60 * 60 * 1000,
        expiresAt: Date.now() - 24 * 60 * 60 * 1000,
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
      localStorageMock.getItem.mockReturnValue(null)
      expect(UserAuthManager.isAuthenticated()).toBe(false)

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
      localStorageMock.getItem.mockReturnValue(null)
      expect(UserAuthManager.getCurrentUserEmail()).toBe(null)

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

      const result = UserAuthManager.createSession('test@example.com', 'some-token')

      expect(result).toBe(false)
    })
  })
})
