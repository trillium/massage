import Link from '@/components/Link'
import type { AuthNavLink } from '@/lib/types'

interface AdminNavItemProps {
  route: AuthNavLink
  pathname: string
  showDescriptions: boolean
}

export default function AdminNavItem({ route, pathname, showDescriptions }: AdminNavItemProps) {
  return (
    <Link
      href={route.href}
      className={`block rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
        pathname === route.href
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="font-medium text-gray-900 dark:text-white">{route.title}</div>
      {showDescriptions && route.description && (
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{route.description}</div>
      )}
    </Link>
  )
}
