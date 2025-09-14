import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthManager } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    console.log('Admin validation request:', {
      email,
      token: token ? `${token.substring(0, 16)}...` : 'null',
      hasSecret: !!process.env.GOOGLE_OAUTH_SECRET,
    })

    if (!email || !token) {
      console.log('Missing email or token')
      return NextResponse.json({ error: 'Email and token are required' }, { status: 400 })
    }

    // Validate the admin access server-side where GOOGLE_OAUTH_SECRET is available
    const isValid = AdminAuthManager.validateAdminAccess(email, token)

    console.log('Validation result:', { isValid, email })

    return NextResponse.json({
      valid: isValid,
      email: isValid ? email : null,
    })
  } catch (error) {
    console.error('Admin validation error:', error)
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
  }
}
