import { NextRequest, NextResponse } from 'next/server'
import { UserAuthServerManager } from '@/lib/userAuthServer'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and token are required' }, { status: 400 })
    }

    const isValid = UserAuthServerManager.validateUserAccess(email, token)

    return NextResponse.json({
      valid: isValid,
      email: isValid ? email : null,
    })
  } catch (error) {
    console.error('User validation error:', error)
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
  }
}
