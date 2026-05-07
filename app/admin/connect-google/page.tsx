import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/server'
import { loadGoogleCredentials } from '@/lib/google/credentials'
import ConnectGoogleClient from './ConnectGoogleClient'

interface PageProps {
  searchParams: Promise<{ connected?: string; error?: string; email?: string }>
}

export const dynamic = 'force-dynamic'

export default async function ConnectGooglePage({ searchParams }: PageProps) {
  const adminUser = await isAdmin()
  if (!adminUser) redirect('/admin')

  const params = await searchParams
  const existingCreds = await loadGoogleCredentials()

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-accent-900 dark:text-accent-100">
        Connect Google Account
      </h1>
      <ConnectGoogleClient
        connectedEmail={existingCreds?.email ?? null}
        successEmail={params.email ?? null}
        error={params.error ?? null}
      />
    </div>
  )
}
