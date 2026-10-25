import { NextRequest, NextResponse } from 'next/server'
import { siteConfig } from '@/lib/siteConfig'
import { captureRefVisit } from '@/lib/ref/serverRefVisit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FLYER_DESTINATION = 'https://airbnb.com/sv/trillium'

function envForHost(hostname: string) {
  const base = new URL(siteConfig.domain.siteUrl).hostname
  return hostname.endsWith(base) ? 'prod' : 'dev'
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  try {
    await captureRefVisit({
      code,
      source: 'flyer',
      destination: FLYER_DESTINATION,
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
      env: envForHost(request.nextUrl.hostname),
    })
  } catch (error) {
    console.error('flyer scan capture failed', { code, error })
  }

  return NextResponse.redirect(FLYER_DESTINATION, 302)
}
