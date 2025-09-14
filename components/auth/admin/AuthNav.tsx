'use client'

import Link from '@/components/Link'
import { usePathname } from 'next/navigation'
import {
  primaryAdminRoutes,
  managementRoutes,
  toolsRoutes,
  testingRoutes,
} from '@/data/authHeaderNavLinks'
import type { AuthNavLink } from '@/lib/types'

interface AuthNavProps {
  showCategories?: boolean
  showDescriptions?: boolean
  layout?: 'grid' | 'list'
}

export default function AuthNav({
  showCategories = true,
  showDescriptions = true,
  layout = 'grid',
}: AuthNavProps) {
  const pathname = usePathname()

  const renderNavSection = (title: string, routes: AuthNavLink[], icon?: string) => (
    <div key={title} className="space-y-3">
      {showCategories && (
        <h3 className="text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h3>
      )}
      <div className={layout === 'grid' ? 'grid gap-2 sm:grid-cols-2 lg:grid-cols-1' : 'space-y-2'}>
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={`block rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
              pathname === route.href
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">{route.title}</div>
            {showDescriptions && route.description && (
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {route.description}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )

  return (
    <nav className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Navigation</h2>
          <div className="text-xs text-gray-500 dark:text-gray-400">{pathname}</div>
        </div>

        <div className="space-y-8">
          {renderNavSection('Dashboard', primaryAdminRoutes, '🏠')}
          {renderNavSection('Management', managementRoutes, '⚙️')}
          {renderNavSection('Tools', toolsRoutes, '🔧')}
          {renderNavSection('Testing', testingRoutes, '🧪')}
        </div>
      </div>
    </nav>
  )
}

// Compact version for header/sidebar use
export function AuthNavCompact() {
  const pathname = usePathname()

  // Only show primary and management routes in compact mode
  const compactRoutes = [...primaryAdminRoutes, ...managementRoutes]

  return (
    <nav className="flex space-x-4">
      {compactRoutes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            pathname === route.href
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
        >
          {route.title}
        </Link>
      ))}
    </nav>
  )
}

// Sidebar version for full-width admin layouts
export function AuthNavSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white shadow-sm dark:bg-gray-800">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h2>
        <AuthNav layout="list" showCategories={true} showDescriptions={false} />
      </div>
    </aside>
  )
}
