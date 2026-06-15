'use client'

import { Suspense } from 'react'
import { AdminAuthProvider } from './AdminAuthProvider'
import Spinner from '@/components/Spinner'
import authData from '@/data/auth.json'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'

const wrapperText = authData.adminWrapper

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

function AdminAuthFallback() {
  return (
    <Stack className="min-h-screen" direction="row" align="center" justify="center">
      <div className="text-center">
        <Spinner />
        <TextBase className="mt-4 text-accent-600 dark:text-accent-400">
          {wrapperText.loading}
        </TextBase>
      </div>
    </Stack>
  )
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  return (
    <Suspense fallback={<AdminAuthFallback />}>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </Suspense>
  )
}
