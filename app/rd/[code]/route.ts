import { NextRequest, NextResponse } from 'next/server'
import { destinationForCode } from '@/lib/qr/scope-defaults'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const destination = destinationForCode(code)

  if (!destination) {
    return new NextResponse('Not found', { status: 404 })
  }

  return NextResponse.redirect(destination, 302)
}
