import { AdminAuthWrapper } from '@/components/auth/admin/AdminAuthWrapper'
import { AdminDebugInfo } from '@/components/auth/admin/AdminDebugInfo'
import AuthNav from '@/components/auth/admin/AuthNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <AuthNav />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </div>
      <AdminDebugInfo />
    </AdminAuthWrapper>
  )
}
