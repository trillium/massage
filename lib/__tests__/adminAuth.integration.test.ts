import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AdminAuthManager } from '@/lib/adminAuth'

// Mock localStorage globally
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Setup global mocks before importing AdminAuthManager
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock fetch for API calls
const fetchMock = vi.fn()
global.fetch = fetchMock

describe('Admin Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret_key'
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockReturnValue(undefined)
    localStorageMock.removeItem.mockReturnValue(undefined)
    fetchMock.mockClear()
  })

  afterEach(() => {
    delete process.env.GOOGLE_OAUTH_SECRET
  })

  describe('Complete Admin Link Flow', () => {
    it('should successfully authenticate admin from email link to admin access', async () => {
      const adminEmail = 'admin@example.com'
      const baseUrl = 'https://example.com'

      // Step 1: Generate admin link (simulating email generation)
      const adminLink = AdminAuthManager.generateAdminLink(adminEmail, baseUrl)
      expect(adminLink).toContain(`${baseUrl}/admin?email=`)
      expect(adminLink).toContain('token=')

      // Step 2: Parse the link (simulating user clicking the link)
      const linkUrl = new URL(adminLink)
      const urlEmail = linkUrl.searchParams.get('email')
      const urlToken = linkUrl.searchParams.get('token')

      expect(urlEmail).toBe(adminEmail)
      expect(urlToken).toBeDefined()
      expect(typeof urlToken).toBe('string')
      expect(urlToken!.length).toBeGreaterThan(0)

      // Step 3: Simulate API validation (server-side validation)
      const isValidServerSide = AdminAuthManager.validateAdminAccess(urlEmail, urlToken)
      expect(isValidServerSide).toBe(true)

      // Step 4: Mock successful API response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ valid: true, email: adminEmail }),
      } as Response)

      // Step 5: Simulate client-side authentication flow
      const apiResponse = await fetch('/api/admin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: urlEmail, token: urlToken }),
      })

      const apiResult = await apiResponse.json()
      expect(apiResult.valid).toBe(true)
      expect(apiResult.email).toBe(adminEmail)

      // Step 6: Create validated session (client-side session creation)
      // Mock localStorage to return the session data
      const mockSession = {
        email: adminEmail,
        token: urlToken,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))

      const sessionCreated = AdminAuthManager.createValidatedSession(adminEmail, urlToken!)
      expect(sessionCreated).toBe(true)

      // Step 7: Verify session exists and is valid
      const session = AdminAuthManager.validateSession()
      expect(session).toEqual(mockSession)

      // Step 8: Verify admin authentication status
      const isAuthenticated = AdminAuthManager.isAuthenticated()
      expect(isAuthenticated).toBe(true)

      const currentEmail = AdminAuthManager.getCurrentAdminEmail()
      expect(currentEmail).toBe(adminEmail)
    })

    it('should reject invalid admin link tokens', async () => {
      const adminEmail = 'admin@example.com'
      const baseUrl = 'https://example.com'

      // Generate valid link
      const adminLink = AdminAuthManager.generateAdminLink(adminEmail, baseUrl)
      const linkUrl = new URL(adminLink)
      const urlEmail = linkUrl.searchParams.get('email')
      let urlToken = linkUrl.searchParams.get('token')

      // Tamper with token
      if (urlToken) {
        urlToken = urlToken.replace('a', 'b')
      }

      // Step 1: Server-side validation should fail
      const isValidServerSide = AdminAuthManager.validateAdminAccess(urlEmail, urlToken)
      expect(isValidServerSide).toBe(false)

      // Step 2: Mock failed API response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ valid: false, email: null }),
      } as Response)

      // Step 3: API validation should fail
      const apiResponse = await fetch('/api/admin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: urlEmail, token: urlToken }),
      })

      const apiResult = await apiResponse.json()
      expect(apiResult.valid).toBe(false)
      expect(apiResult.email).toBeNull()

      // Step 4: Session creation should fail
      const sessionCreated = AdminAuthManager.createSession(adminEmail, urlToken!)
      expect(sessionCreated).toBe(false)

      // Step 5: No session should exist
      const session = AdminAuthManager.validateSession()
      expect(session).toBeNull()

      // Step 6: Authentication should fail
      const isAuthenticated = AdminAuthManager.isAuthenticated()
      expect(isAuthenticated).toBe(false)

      const currentEmail = AdminAuthManager.getCurrentAdminEmail()
      expect(currentEmail).toBeNull()

      // Verify localStorage was not called for session creation
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle expired admin tokens', async () => {
      const adminEmail = 'admin@example.com'

      // Create an expired token manually (simulate token that expired 1 second ago)
      const expiredPayload = `${adminEmail}:${Date.now() - 1000}` // 1 second ago
      const signature = 'fake-signature' // This would normally be HMAC
      const expiredToken = btoa(expiredPayload + '|' + signature)

      // Step 1: Server-side validation should fail for expired token
      const isValidServerSide = AdminAuthManager.validateAdminAccess(adminEmail, expiredToken)
      expect(isValidServerSide).toBe(false)

      // Step 2: Mock failed API response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ valid: false, email: null }),
      } as Response)

      // Step 3: API validation should fail
      const apiResponse = await fetch('/api/admin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, token: expiredToken }),
      })

      const apiResult = await apiResponse.json()
      expect(apiResult.valid).toBe(false)

      // Step 4: Session creation should fail
      const sessionCreated = AdminAuthManager.createSession(adminEmail, expiredToken)
      expect(sessionCreated).toBe(false)

      // Step 5: No authentication
      const isAuthenticated = AdminAuthManager.isAuthenticated()
      expect(isAuthenticated).toBe(false)
    })

    it('should maintain admin session across page reloads', async () => {
      const adminEmail = 'admin@example.com'
      const baseUrl = 'https://example.com'

      // Step 1: Generate and validate admin link
      const adminLink = AdminAuthManager.generateAdminLink(adminEmail, baseUrl)
      const linkUrl = new URL(adminLink)
      const urlToken = linkUrl.searchParams.get('token')

      // Step 2: Create session and mock localStorage to return it
      const mockSession = {
        email: adminEmail,
        token: urlToken,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))

      const sessionCreated = AdminAuthManager.createValidatedSession(adminEmail, urlToken!)
      expect(sessionCreated).toBe(true)

      // Step 3: Simulate page reload - session should persist
      const sessionAfterReload = AdminAuthManager.validateSession()
      expect(sessionAfterReload).toEqual(mockSession)

      // Step 4: Authentication should still work
      const isAuthenticated = AdminAuthManager.isAuthenticated()
      expect(isAuthenticated).toBe(true)

      const currentEmail = AdminAuthManager.getCurrentAdminEmail()
      expect(currentEmail).toBe(adminEmail)
    })

    it('should properly clear admin session on logout', async () => {
      const adminEmail = 'admin@example.com'
      const baseUrl = 'https://example.com'

      // Step 1: Create admin session
      const adminLink = AdminAuthManager.generateAdminLink(adminEmail, baseUrl)
      const linkUrl = new URL(adminLink)
      const urlToken = linkUrl.searchParams.get('token')

      // Mock session in localStorage
      const mockSession = {
        email: adminEmail,
        token: urlToken,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))

      AdminAuthManager.createValidatedSession(adminEmail, urlToken!)

      // Verify session exists
      expect(AdminAuthManager.isAuthenticated()).toBe(true)

      // Step 2: Clear session (logout)
      AdminAuthManager.clearSession()

      // Step 3: Verify session is cleared - mock localStorage to return null
      localStorageMock.getItem.mockReturnValue(null)

      const session = AdminAuthManager.validateSession()
      expect(session).toBeNull()

      expect(AdminAuthManager.isAuthenticated()).toBe(false)
      expect(AdminAuthManager.getCurrentAdminEmail()).toBeNull()

      // Verify localStorage removeItem was called
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_session')
    })
  })

  describe('Admin Link Security', () => {
    it('should reject tokens with wrong email', async () => {
      const adminEmail = 'admin@example.com'
      const wrongEmail = 'hacker@example.com'
      const baseUrl = 'https://example.com'

      // Generate link for admin
      const adminLink = AdminAuthManager.generateAdminLink(adminEmail, baseUrl)
      const linkUrl = new URL(adminLink)
      const urlToken = linkUrl.searchParams.get('token')

      // Try to use token with different email
      const isValid = AdminAuthManager.validateAdminAccess(wrongEmail, urlToken)
      expect(isValid).toBe(false)

      // Session creation should fail
      const sessionCreated = AdminAuthManager.createSession(wrongEmail, urlToken!)
      expect(sessionCreated).toBe(false)
    })

    it('should reject malformed tokens', async () => {
      const adminEmail = 'admin@example.com'

      const malformedTokens = [
        'not-base64',
        '',
        'invalid|format',
        btoa('missing-signature'),
        btoa('email|only'),
      ]

      for (const token of malformedTokens) {
        const isValid = AdminAuthManager.validateAdminAccess(adminEmail, token)
        expect(isValid).toBe(false)
      }
    })

    it('should handle localStorage errors gracefully during authentication', async () => {
      const adminEmail = 'admin@example.com'
      const baseUrl = 'https://example.com'

      // Generate valid link
      const adminLink = AdminAuthManager.generateAdminLink(adminEmail, baseUrl)
      const linkUrl = new URL(adminLink)
      const urlToken = linkUrl.searchParams.get('token')

      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      // Session creation should fail gracefully
      const sessionCreated = AdminAuthManager.createValidatedSession(adminEmail, urlToken!)
      expect(sessionCreated).toBe(false)

      // Should still be able to validate without session
      const isValid = AdminAuthManager.validateAdminAccess(adminEmail, urlToken)
      expect(isValid).toBe(true)
    })
  })
})
