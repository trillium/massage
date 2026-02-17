import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AdminAuthProvider } from '@/components/auth/admin/AdminAuthProvider'

const mockRouter = {
  replace: vi.fn(),
  push: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null })
const mockSignOut = vi.fn().mockResolvedValue({ error: null })
const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })

const safeSingle = (...args: unknown[]) =>
  mockSingle(...args) ?? Promise.resolve({ data: null, error: null })

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: vi.fn(() => ({
    auth: {
      getUser: (...args: unknown[]) =>
        mockGetUser(...args) ?? Promise.resolve({ data: { user: null }, error: null }),
      signOut: mockSignOut,
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: safeSingle,
        }),
      }),
    }),
  })),
  supabase: {},
}))

vi.mock('@/components/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}))

const mockIdentify = vi.fn()
vi.mock('@/lib/posthog-utils', () => ({
  identifyAuthenticatedUser: (...args: unknown[]) => mockIdentify(...args),
}))

vi.mock('@headlessui/react', () => ({
  Menu: ({ children }: { children: React.ReactNode }) => <div data-testid="menu">{children}</div>,
  MenuButton: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
  MenuItems: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="menu-items">{children}</div>
  ),
  MenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

function mockAdminUser(email = 'admin@example.com') {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-1', email } },
    error: null,
  })
  mockSingle.mockResolvedValue({
    data: { role: 'admin' },
    error: null,
  })
}

function mockNoUser() {
  mockGetUser.mockResolvedValue({
    data: { user: null },
    error: null,
  })
}

function mockNonAdminUser() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-2', email: 'user@example.com' } },
    error: null,
  })
  mockSingle.mockResolvedValue({
    data: { role: 'user' },
    error: null,
  })
}

function mockProfileError() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-3', email: 'admin@example.com' } },
    error: null,
  })
  mockSingle.mockResolvedValue({
    data: null,
    error: { message: 'Profile not found' },
  })
}

describe('AdminAuthProvider', () => {
  const TestChild = () => <div data-testid="test-child">Admin Content</div>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows spinner while checking auth', () => {
      mockGetUser.mockReturnValue(new Promise(() => {}))

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      expect(screen.getByText('Verifying admin access...')).toBeInTheDocument()
      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument()
    })
  })

  describe('Authenticated Admin', () => {
    it('renders children when user is admin', async () => {
      mockAdminUser()

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument()
      })
    })

    it('shows admin chip with email', async () => {
      mockAdminUser('admin@example.com')

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('✓ Admin admin@example.com')).toBeInTheDocument()
      })
    })

    it('identifies user via PostHog', async () => {
      mockAdminUser('admin@example.com')

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(mockIdentify).toHaveBeenCalledWith('admin@example.com', 'admin_session')
      })
    })
  })

  describe('Not Authenticated', () => {
    it('shows access denied when no user session', async () => {
      mockNoUser()

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(screen.getByText('Please log in to access admin panel.')).toBeInTheDocument()
      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument()
    })

    it('shows access denied when user is not admin', async () => {
      mockNonAdminUser()

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(
        screen.getByText('Admin access required. Your account does not have admin privileges.')
      ).toBeInTheDocument()
    })

    it('shows error when profile fetch fails', async () => {
      mockProfileError()

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(screen.getByText('Unable to verify admin access.')).toBeInTheDocument()
    })

    it('shows login link', async () => {
      mockNoUser()

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      const loginLink = screen.getByRole('link', { name: 'log in' })
      expect(loginLink).toHaveAttribute('href', '/auth/login')
    })
  })

  describe('Error Handling', () => {
    it('handles getUser error gracefully', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth service unavailable' },
      })

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(screen.getByText('Please log in to access admin panel.')).toBeInTheDocument()
    })

    it('handles unexpected errors gracefully', async () => {
      mockGetUser.mockRejectedValue(new Error('Network failure'))

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
      })

      expect(screen.getByText('An error occurred while checking admin access.')).toBeInTheDocument()
    })
  })

  describe('Logout', () => {
    it('calls signOut and redirects to login', async () => {
      mockAdminUser()

      render(
        <AdminAuthProvider>
          <TestChild />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument()
      })

      screen.getByText('Logout').click()

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
      })

      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
    })
  })
})
