import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/server'
import { loadGoogleCredentials } from '@/lib/google/credentials'
import ConnectGoogleClient from './ConnectGoogleClient'
import { H1 } from '@/components/ui/heading'

interface PageProps {
  searchParams: Promise<{ connected?: string; error?: string; email?: string }>
}

export const dynamic = 'force-dynamic'

export default async function ConnectGooglePage({ searchParams }: PageProps) {
  const isDev = process.env.NODE_ENV === 'development'
  const adminUser = isDev ? true : await isAdmin()
  if (!adminUser) redirect('/admin')

  const params = await searchParams
  const existingCreds = await loadGoogleCredentials()

  return (
    <div className="max-w-lg">
      <H1 className="mb-6">Connect Google Account</H1>
      <ConnectGoogleClient
        connectedEmail={existingCreds?.email ?? null}
        successEmail={params.email ?? null}
        error={params.error ?? null}
      />
    </div>
  )
}
