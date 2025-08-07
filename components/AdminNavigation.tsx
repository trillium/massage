'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminRoutes = [
  { href: '/admin', label: 'Calendar Events', description: 'URI maker and event viewer' },
  {
    href: '/admin/active-event-containers',
    label: 'Event Containers',
    description: 'Monitor container-based availability',
  },
  {
    href: '/admin/promo-routes',
    label: 'Promo Routes',
    description: 'View all promotional booking routes',
  },
  {
    href: '/admin/reviews-list',
    label: 'Customer Reviews',
    description: 'View customer ratings and feedback',
  },
]

export default function AdminNavigation() {
  const pathname = usePathname()

  return (
    <nav className="mb-8">
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Admin Tools</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {adminRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`block rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                pathname === route.href
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <h3 className="font-medium text-gray-900 dark:text-white">{route.label}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{route.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
