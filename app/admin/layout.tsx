import { AdminAuthWrapper } from '@/components/auth/admin/AdminAuthWrapper'
import { Box } from '@/components/ui/box'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthWrapper>
      <Box className="min-h-screen bg-surface-100 dark:bg-surface-900">
        <Box className="mx-auto max-w-7xl px-4 py-8">{children}</Box>
      </Box>
    </AdminAuthWrapper>
  )
}
