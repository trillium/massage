/**
 * Supabase Admin Demote API Route
 *
 * POST /api/auth/supabase/admin/demote - Demote admin to user (admin-only)
 */

import { NextResponse } from 'next/server'
import { getSupabaseAdminClient, isAdmin } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const admin = await isAdmin()

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { error } = await supabase.rpc('demote_to_user', { user_id: userId })

    if (error) {
      console.error('Error demoting user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Demote API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
