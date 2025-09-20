import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AdminAuthProvider } from '@/components/auth/admin/AdminAuthProvider'
import { AdminAuthManager } from '@/lib/adminAuth'

// Mock Next.js navigation
const mockSearchParams = new URLSearchParams()
const mockRouter = {
  replace: vi.fn(),
  push: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => mockRouter,
}))

// Mock AdminAuthManager
vi.mock('@/lib/adminAuth', () => ({
  AdminAuthManager: {
    validateAdminAccess: vi.fn(),
    createValidatedSession: vi.fn(),
    validateSession: vi.fn(),
    clearSession: vi.fn(),
    isAuthenticated: vi.fn(),
    getCurrentAdminEmail: vi.fn(),
  },
}))

// Mock fetch
const fetchMock = vi.fn()
global.fetch = fetchMock

// Mock Spinner component
vi.mock('@/components/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}))

// Mock AdminDebugInfo component
vi.mock('@/components/auth/admin/AdminDebugInfo', () => ({
  AdminDebugInfo: () => <div data-testid="debug-info">Debug Info</div>,
}))

// Mock PostHog
vi.mock('@/lib/posthog-utils', () => ({
  identifyAuthenticatedUser: vi.fn(),
}))

describe('AdminAuthProvider', () => {
  const TestChild = () => <div data-testid="test-child">Admin Content</div>

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('email')
    mockSearchParams.delete('token')
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'

    // Default mocks
    vi.mocked(AdminAuthManager.validateSession).mockReturnValue(null)
    vi.mocked(AdminAuthManager.isAuthenticated).mockReturnValue(false)
    vi.mocked(AdminAuthManager.getCurrentAdminEmail).mockReturnValue(null)
  })

  afterEach(() => {
    delete process.env.GOOGLE_OAUTH_SECRET
  })

  describe('Initial Loading State', () => {
    it('should show loading spinner initially', async () => {
      // Mock fetch to return a promise that doesn't resolve immediately
      let resolveFetch: (value: Response) => void
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve
      })
      fetchMock.mockReturnValue(fetchPromise)

      // Set URL parameters to trigger the fetch path
      mockSearchParams.set('email', 'admin@example.com')
      mockSearchParams.set('token', 'test-token')

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      // Should show loading state initially
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument()

      // Resolve the fetch to complete the authentication
      resolveFetch!({
        ok: true,
        json: () => Promise.resolve({ valid: true }),
      } as Response)
    })

    it('should show loading text', async () => {
      // Mock fetch to return a promise that doesn't resolve immediately
      let resolveFetch: (value: Response) => void
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve
      })
      fetchMock.mockReturnValue(fetchPromise)

      // Set URL parameters to trigger the fetch path
      mockSearchParams.set('email', 'admin@example.com')
      mockSearchParams.set('token', 'test-token')

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      expect(screen.getByText('Verifying admin access...')).toBeInTheDocument()

      // Resolve the fetch to complete the authentication
      resolveFetch!({
        ok: true,
        json: () => Promise.resolve({ valid: true }),
      } as Response)
    })
  })

  describe('No URL Parameters - Check Existing Session', () => {
    it('should authenticate user with valid existing session', async () => {
      const mockSession = {
        email: 'admin@example.com',
        token: 'valid-token',
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }

      vi.mocked(AdminAuthManager.validateSession).mockReturnValue(mockSession)
      vi.mocked(AdminAuthManager.isAuthenticated).mockReturnValue(true)
      vi.mocked(AdminAuthManager.getCurrentAdminEmail).mockReturnValue('admin@example.com')

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument()
      })

      expect(screen.getByText('✓ Admin admin@example.com')).toBeInTheDocument()
    })

    it('should show access denied for no existing session', async () => {
      vi.mocked(AdminAuthManager.validateSession).mockReturnValue(null)

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(
        screen.getByText('Admin access required. Please use your secure admin link.')
      ).toBeInTheDocument()
    })
  })

  describe('URL Parameters - New Login Flow', () => {
    it('should successfully authenticate with valid URL parameters', async () => {
      const adminEmail = 'admin@example.com'
      const adminToken = 'valid-token-123'

      // Set URL parameters
      mockSearchParams.set('email', adminEmail)
      mockSearchParams.set('token', adminToken)

      // Mock successful API response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, email: adminEmail }),
      })

      // Mock successful session creation
      vi.mocked(AdminAuthManager.createValidatedSession).mockReturnValue(true)

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('/api/admin/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: adminEmail, token: adminToken }),
        })
      })

      await waitFor(() => {
        expect(AdminAuthManager.createValidatedSession).toHaveBeenCalledWith(adminEmail, adminToken)
      })

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument()
      })
    })

    it('should reject invalid URL parameters', async () => {
      const adminEmail = 'admin@example.com'
      const invalidToken = 'invalid-token'

      // Set URL parameters
      mockSearchParams.set('email', adminEmail)
      mockSearchParams.set('token', invalidToken)

      // Mock failed API response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: false, email: null }),
      })

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(
        screen.getByText('Invalid admin credentials. Please check your admin link.')
      ).toBeInTheDocument()
      expect(AdminAuthManager.createValidatedSession).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const adminEmail = 'admin@example.com'
      const adminToken = 'some-token'

      // Set URL parameters
      mockSearchParams.set('email', adminEmail)
      mockSearchParams.set('token', adminToken)

      // Mock API error
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(AdminAuthManager.createValidatedSession).not.toHaveBeenCalled()
    })

    it('should handle session creation failure', async () => {
      const adminEmail = 'admin@example.com'
      const adminToken = 'valid-token'

      // Set URL parameters
      mockSearchParams.set('email', adminEmail)
      mockSearchParams.set('token', adminToken)

      // Mock successful API response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, email: adminEmail }),
      })

      // Mock failed session creation
      vi.mocked(AdminAuthManager.createValidatedSession).mockReturnValue(false)

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })
    })

    it('should clean URL after successful authentication', async () => {
      const adminEmail = 'admin@example.com'
      const adminToken = 'valid-token'

      // Set URL parameters
      mockSearchParams.set('email', adminEmail)
      mockSearchParams.set('token', adminToken)

      // Mock successful flow
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, email: adminEmail }),
      })
      vi.mocked(AdminAuthManager.createValidatedSession).mockReturnValue(true)

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalled()
      })

      const replaceCall = mockRouter.replace.mock.calls[0][0]
      expect(replaceCall).not.toContain('email=')
      expect(replaceCall).not.toContain('token=')
    })
  })

  describe('Logout Functionality', () => {
    it('should handle logout correctly', async () => {
      const mockSession = {
        email: 'admin@example.com',
        token: 'valid-token',
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }

      vi.mocked(AdminAuthManager.validateSession).mockReturnValue(mockSession)
      vi.mocked(AdminAuthManager.isAuthenticated).mockReturnValue(true)
      vi.mocked(AdminAuthManager.getCurrentAdminEmail).mockReturnValue('admin@example.com')

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument()
      })

      // Find and click logout button
      const logoutButton = screen.getByText('Logout')
      logoutButton.click()

      expect(AdminAuthManager.clearSession).toHaveBeenCalled()

      // Should show access denied after logout
      await waitFor(() => {
        expect(screen.getByText('Logged out successfully.')).toBeInTheDocument()
      })
    })
  })

  describe('Error States', () => {
    it('should handle missing email parameter', async () => {
      mockSearchParams.set('token', 'some-token')
      // Missing email parameter

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('should handle missing token parameter', async () => {
      mockSearchParams.set('email', 'admin@example.com')
      // Missing token parameter

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('PostHog Integration', () => {
    it('should identify user on successful authentication', async () => {
      const adminEmail = 'admin@example.com'
      const adminToken = 'valid-token'

      // Set URL parameters
      mockSearchParams.set('email', adminEmail)
      mockSearchParams.set('token', adminToken)

      // Mock successful flow
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, email: adminEmail }),
      })
      vi.mocked(AdminAuthManager.createValidatedSession).mockReturnValue(true)

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument()
      })

      // PostHog identification should be called
      const { identifyAuthenticatedUser } = await import('@/lib/posthog-utils')
      expect(identifyAuthenticatedUser).toHaveBeenCalledWith(adminEmail, 'admin_login')
    })

    it('should identify user on existing session validation', async () => {
      const mockSession = {
        email: 'admin@example.com',
        token: 'valid-token',
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }

      vi.mocked(AdminAuthManager.validateSession).mockReturnValue(mockSession)

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument()
      })

      // PostHog identification should be called for returning admin
      const { identifyAuthenticatedUser } = await import('@/lib/posthog-utils')
      expect(identifyAuthenticatedUser).toHaveBeenCalledWith('admin@example.com', 'admin_session')
    })
  })
})
