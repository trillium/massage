import { AdminAuthWrapper } from '@/components/auth/admin/AdminAuthWrapper'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-surface-100 dark:bg-surface-900">
        <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
      </div>
    </AdminAuthWrapper>
  )
}
