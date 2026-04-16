import { AdminAuthWrapper } from '@/components/auth/admin/AdminAuthWrapper'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/admin', label: 'Calendar' },
  { href: '/admin/schedule', label: 'Schedule' },
  { href: '/admin/active-event-containers', label: 'Containers' },
  { href: '/admin/create-container', label: 'New Container' },
  { href: '/admin/gmail-events', label: 'Gmail' },
  { href: '/admin/pending', label: 'Pending' },
  { href: '/admin/booked', label: 'Booked' },
  { href: '/admin/reviews-list', label: 'Reviews' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-surface-100 dark:bg-surface-900">
        <nav className="border-b border-accent-200 bg-surface-50 dark:border-accent-700 dark:bg-surface-800">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-accent-700 transition-colors hover:bg-accent-100 hover:text-accent-900 dark:text-accent-300 dark:hover:bg-accent-800 dark:hover:text-accent-100"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
      </div>
    </AdminAuthWrapper>
  )
}
