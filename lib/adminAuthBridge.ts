import { NextResponse } from 'next/server'
import { isAdmin, getUser } from '@/lib/supabase/server'

export async function requireAdminWithFlag(
  _request: Request
): Promise<NextResponse | { email: string }> {
  const user = await getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return { email: user.email }
}
