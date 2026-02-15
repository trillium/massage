/**
 * Supabase Profile API Route
 *
 * GET  /api/auth/supabase/profile - Get current user's profile
 * PUT  /api/auth/supabase/profile - Update current user's profile
 */

import { NextResponse } from 'next/server'
import { getSupabaseServerClient, getUser } from '@/lib/supabase/server'

export async function GET() {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Profile API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const supabase = await getSupabaseServerClient()

    const allowedUpdates = ['email']
    const updates: any = {}

    for (const key of allowedUpdates) {
      if (key in body) {
        updates[key] = body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Profile update API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
