import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthManager } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and token are required' }, { status: 400 })
    }

    // Validate the admin access server-side where GOOGLE_OAUTH_SECRET is available
    const isValid = AdminAuthManager.validateAdminAccess(email, token)

    return NextResponse.json({
      valid: isValid,
      email: isValid ? email : null,
    })
  } catch (error) {
    console.error('Admin validation error:', error)
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
  }
}
