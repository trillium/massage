import { NextRequest, NextResponse } from 'next/server'
import { UserAuthManager } from '@/lib/userAuth'
import { hashHmac } from '@/lib/hash'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    console.log('User validation request:', {
      email,
      token: token ? `${token.substring(0, 16)}...` : 'null',
    })

    if (!email || !token) {
      console.log('Missing email or token')
      return NextResponse.json({ error: 'Email and token are required' }, { status: 400 })
    }

    // Validate the user access server-side
    const isValid = UserAuthManager.validateUserAccess(email, token)

    console.log('Validation result:', { isValid, email })

    return NextResponse.json({
      valid: isValid,
      email: isValid ? email : null,
    })
  } catch (error) {
    console.error('User validation error:', error)
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
  }
}
