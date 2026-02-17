import { NextRequest, NextResponse } from 'next/server'
import { resolveConfiguration } from '@/lib/slugConfigurations/helpers/resolveConfiguration'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const { configuration } = await resolveConfiguration(slug, {})
    return NextResponse.json(configuration, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
  }
}
