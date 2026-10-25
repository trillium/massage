import { NextRequest, NextResponse } from 'next/server'
import { captureRedirectScan, findTrackedRedirect } from '@/lib/redirect/trackedRedirect'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const redirect = findTrackedRedirect(id)
  if (!redirect) return NextResponse.redirect(new URL('/', request.url))

  try {
    await captureRedirectScan(
      redirect,
      {
        userAgent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer'),
      },
      request.nextUrl.hostname
    )
  } catch (error) {
    console.error('redirect scan capture failed', { slug: id, error })
  }

  return NextResponse.redirect(redirect.destination, 302)
}
