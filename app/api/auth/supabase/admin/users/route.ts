/**
 * Supabase Admin Users API Route
 *
 * GET /api/auth/supabase/admin/users - List all users (admin-only)
 */

import { NextResponse } from 'next/server'
import { getSupabaseAdminClient, isAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const admin = await isAdmin()

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users: profiles })
  } catch (err) {
    console.error('Admin users API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
