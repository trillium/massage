import { NextRequest } from 'next/server'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import { healthResponse, errorResponse } from '@/lib/health/shared'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const result = await createPageConfiguration({
      bookingSlug: slug,
      resolvedParams: {},
    })

    const config = result.configuration
    if (!config || config.type === null) {
      return healthResponse({ ok: false, slug, error: 'unknown slug' }, 404)
    }

    const slots = result.slots ?? []
    const uniqueDates = [...new Set(slots.map((s) => s.start.slice(0, 10)))]

    return healthResponse({
      ok: slots.length > 0,
      slug,
      type: config.type,
      slots_available: slots.length,
      dates_with_slots: uniqueDates.length,
      next_available: slots[0]?.start ?? null,
      duration: result.duration,
      date_range: {
        start: result.start?.start ?? null,
        end: result.end?.end ?? null,
      },
      busy_count: result.data?.busy?.length ?? 0,
      schema: process.env.TENANT_SLUG ?? 'public',
    })
  } catch (err) {
    return errorResponse(err, { slug })
  }
}
