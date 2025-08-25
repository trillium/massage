import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthManager } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  try {
    const { email, hash } = await request.json()

    console.log('Admin validation request:', {
      email,
      hash: hash ? `${hash.substring(0, 16)}...` : 'null',
      hasSecret: !!process.env.GOOGLE_OAUTH_SECRET,
    })

    if (!email || !hash) {
      console.log('Missing email or hash')
      return NextResponse.json({ error: 'Email and hash are required' }, { status: 400 })
    }

    // Validate the admin access server-side where GOOGLE_OAUTH_SECRET is available
    const isValid = AdminAuthManager.validateAdminAccess(email, hash)

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
