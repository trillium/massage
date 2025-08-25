'use client'

import { Suspense } from 'react'
import { AdminAuthProvider } from './AdminAuthProvider'
import Spinner from '@/components/Spinner'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

function AdminAuthFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin panel...</p>
      </div>
    </div>
  )
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  return (
    <Suspense fallback={<AdminAuthFallback />}>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </Suspense>
  )
}
