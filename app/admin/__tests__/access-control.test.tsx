import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AdminAuthWrapper } from '@/components/auth/admin/AdminAuthWrapper'

const mockRouter = {
  replace: vi.fn(),
  push: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null })
const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: vi.fn(() => ({
    auth: {
      getUser: (...args: unknown[]) =>
        mockGetUser(...args) ?? Promise.resolve({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: (...args: unknown[]) =>
            mockSingle(...args) ?? Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  })),
  supabase: {},
}))

vi.mock('@/components/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}))

vi.mock('@/components/auth/admin/AdminDebugInfo', () => ({
  AdminDebugInfo: () => <div data-testid="debug-info">Debug Info</div>,
}))

vi.mock('@/lib/posthog-utils', () => ({
  identifyAuthenticatedUser: vi.fn(),
}))

vi.mock('@headlessui/react', () => ({
  Menu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MenuButton: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
  MenuItems: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Admin Page Access Control', () => {
  const TestAdminContent = () => <div data-testid="admin-content">Admin Dashboard</div>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AdminAuthWrapper', () => {
    it('renders children when user is admin', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'admin@example.com' } },
        error: null,
      })
      mockSingle.mockResolvedValue({
        data: { role: 'admin' },
        error: null,
      })

      render(
        <AdminAuthWrapper>
          <TestAdminContent />
        </AdminAuthWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('admin-content')).toBeInTheDocument()
      })
    })

    it('shows access denied when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

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

    it('shows loading state initially', () => {
      mockGetUser.mockReturnValue(new Promise(() => {}))

      render(
        <AdminAuthWrapper>
          <TestAdminContent />
        </AdminAuthWrapper>
      )

      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      expect(screen.getByText('Verifying admin access...')).toBeInTheDocument()
    })

    it('shows access denied for non-admin user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-2', email: 'user@example.com' } },
        error: null,
      })
      mockSingle.mockResolvedValue({
        data: { role: 'user' },
        error: null,
      })

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
