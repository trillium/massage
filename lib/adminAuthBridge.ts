import { NextResponse } from 'next/server'
import { AdminAuthManager } from '@/lib/adminAuth'
import { isAdmin, getUser } from '@/lib/supabase/server'
import { isFeatureEnabled } from '@/lib/posthog-server'

const FLAG_NAME = 'use-supabase-admin-auth'

export async function requireAdminWithFlag(
  request: Request
): Promise<NextResponse | { email: string }> {
  const user = await getUser()
  const distinctId = user?.email || 'anonymous'

  const useSupabase = await isFeatureEnabled(FLAG_NAME, distinctId)

  if (useSupabase) {
    const admin = await isAdmin()
    if (admin && user?.email) {
      return { email: user.email }
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return AdminAuthManager.requireAdmin(request)
}
