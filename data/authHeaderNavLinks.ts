import type { AuthNavLink } from '@/lib/types'

const authHeaderNavLinks: AuthNavLink[] = [
  // Primary Admin Routes
  {
    href: '/admin',
    title: 'Dashboard',
    description: 'Calendar events and URI maker',
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
  // Note: /admin/event/[event_id] is a dynamic route and should not be included in static navigation

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

  // Access Management
  {
    href: '/admin/request-access',
    title: 'Request Access',
    description: 'Request admin access (public)',
    category: 'management',
  },
]

// Filtered lists for different contexts
export const primaryAdminRoutes = authHeaderNavLinks.filter((route) => route.category === 'primary')

export const managementRoutes = authHeaderNavLinks.filter(
  (route) => route.category === 'management'
)

export const toolsRoutes = authHeaderNavLinks.filter((route) => route.category === 'tools')

export const testingRoutes = authHeaderNavLinks.filter((route) => route.category === 'testing')

// Public routes (accessible without authentication)
export const publicAuthRoutes = authHeaderNavLinks.filter(
  (route) => route.href === '/admin/request-access'
)

// Protected routes (require authentication)
export const protectedAuthRoutes = authHeaderNavLinks.filter(
  (route) => route.href !== '/admin/request-access'
)

export default authHeaderNavLinks
