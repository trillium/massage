import { AdminAuthWrapper } from '@/components/auth/admin/AdminAuthWrapper'
import { AdminDebugInfo } from '@/components/auth/admin/AdminDebugInfo'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
      </div>
      <AdminDebugInfo />
    </AdminAuthWrapper>
  )
}
