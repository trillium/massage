import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AdminAuthWrapper } from '@/components/auth/admin/AdminAuthWrapper'
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

// Mock fetch
const fetchMock = vi.fn()
global.fetch = fetchMock

// Mock AdminAuthManager
vi.mock('@/lib/adminAuth', () => ({
  AdminAuthManager: {
    validateSession: vi.fn(),
    isAuthenticated: vi.fn(),
    getCurrentAdminEmail: vi.fn(),
    createValidatedSession: vi.fn(),
    clearSession: vi.fn(),
  },
}))

// Mock components
vi.mock('@/components/auth/admin/AdminNav', () => ({
  default: () => <nav data-testid="auth-nav">Auth Navigation</nav>,
}))

vi.mock('@/components/auth/admin/AdminDebugInfo', () => ({
  AdminDebugInfo: () => <div data-testid="debug-info">Debug Info</div>,
}))

vi.mock('@/components/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}))

describe('Admin Page Access Control', () => {
  const TestAdminContent = () => <div data-testid="admin-content">Admin Dashboard</div>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AdminAuthWrapper', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      mockSearchParams.delete('email')
      mockSearchParams.delete('token')
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ valid: true }),
      } as Response)
    })

    it('should render children when authenticated', async () => {
      // Mock successful authentication via URL parameters
      mockSearchParams.set('email', 'admin@example.com')
      mockSearchParams.set('token', 'valid-token')
      vi.mocked(AdminAuthManager.createValidatedSession).mockReturnValue(true)

      render(
        <AdminAuthWrapper>
          <TestAdminContent />
        </AdminAuthWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('admin-content')).toBeInTheDocument()
      })
    })

    it('should show access denied when not authenticated', async () => {
      // No URL parameters and no valid session
      vi.mocked(AdminAuthManager.validateSession).mockReturnValue(null)

      render(
        <AdminAuthWrapper>
          <TestAdminContent />
        </AdminAuthWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    })

    it('should show loading state initially', async () => {
      // Mock fetch to delay response so we can see loading state
      let resolveFetch: (value: Response) => void
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve
      })
      fetchMock.mockReturnValue(fetchPromise)

      // Set URL parameters to trigger fetch
      mockSearchParams.set('email', 'admin@example.com')
      mockSearchParams.set('token', 'test-token')

      render(
        <AdminAuthWrapper>
          <TestAdminContent />
        </AdminAuthWrapper>
      )

      // Should show loading state initially
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      expect(screen.getByText('Verifying admin access...')).toBeInTheDocument()

      // Resolve fetch to complete authentication
      resolveFetch!({
        ok: true,
        json: () => Promise.resolve({ valid: true }),
      } as Response)
    })

    it('should handle session validation', async () => {
      const mockSession = {
        email: 'admin@example.com',
        token: 'valid-token',
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }

      vi.mocked(AdminAuthManager.validateSession).mockReturnValue(mockSession)

      render(
        <AdminAuthWrapper>
          <TestAdminContent />
        </AdminAuthWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('admin-content')).toBeInTheDocument()
      })
    })

    it('should handle invalid session', async () => {
      vi.mocked(AdminAuthManager.validateSession).mockReturnValue(null)

      render(
        <AdminAuthWrapper>
          <TestAdminContent />
        </AdminAuthWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })
    })
  })
})
