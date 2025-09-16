import type { AuthNavLink } from '@/lib/types'

const authHeaderNavLinks: AuthNavLink[] = [
  // Primary Admin Routes
  {
    href: '/admin',
    title: 'Calendar Events',
    description: 'URI maker and event viewer',
    category: 'primary',
  },

  // Management Tools
  {
    href: '/admin/active-event-containers',
    title: 'Event Containers',
    description: 'Monitor container-based availability',
    category: 'management',
  },
  {
    href: '/admin/promo-routes',
    title: 'Promo Routes',
    description: 'View all promotional booking routes',
    category: 'management',
  },
  {
    href: '/admin/reviews-list',
    title: 'Reviews',
    description: 'Customer ratings and feedback',
    category: 'management',
  },

  // Tools & Utilities
  {
    href: '/admin/isTestUser',
    title: 'Test Users',
    description: 'User management and testing',
    category: 'tools',
  },
  {
    href: '/admin/gmail-events',
    title: 'Gmail Emails',
    description: 'Search and parse Soothe booking emails',
    category: 'tools',
  },

  // Testing & Development
  {
    href: '/admin/mocked_user_flow',
    title: 'Mock User Flow',
    description: 'Test user booking flows',
    category: 'testing',
  },
  {
    href: '/admin/mock-form-validators',
    title: 'Form Validators',
    description: 'Test form validation',
    category: 'testing',
  },
  {
    href: '/admin/test-dynamic-fields',
    title: 'Dynamic Fields',
    description: 'Test dynamic form fields',
    category: 'testing',
  },
]

// Filtered lists for different contexts
export const primaryAdminRoutes = authHeaderNavLinks.filter((route) => route.category === 'primary')

export const managementRoutes = authHeaderNavLinks.filter(
  (route) => route.category === 'management'
)

export const toolsRoutes = authHeaderNavLinks.filter((route) => route.category === 'tools')

export const testingRoutes = authHeaderNavLinks.filter((route) => route.category === 'testing')

// Protected routes (require authentication)
export const protectedAuthRoutes = authHeaderNavLinks.filter(
  (route) => route.href !== '/admin/request-access'
)

export default authHeaderNavLinks
