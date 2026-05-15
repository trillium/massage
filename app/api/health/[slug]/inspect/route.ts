import { NextRequest, NextResponse } from 'next/server'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'

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
      return NextResponse.json({ error: 'unknown slug' }, { status: 404 })
    }

    const slots = result.slots ?? []

    return NextResponse.json({
      slug,
      type: config.type,
      hideCalendar: config.hideCalendar ?? false,
      duration: result.duration,
      defaultDuration: config.defaultDuration,
      allowedDurations: config.allowedDurations,
      leadTimeMinimum: config.leadTimeMinimum,
      slots_count: slots.length,
      first_3_slots: slots.slice(0, 3),
      containers_count: result.data?.containers?.length ?? 0,
      containers_summary: result.data?.containers?.map((c) => ({
        summary: c.summary,
        start: c.start?.dateTime,
        end: c.end?.dateTime,
        location: c.location,
      })),
      busy_count: result.data?.busy?.length ?? 0,
      busy: result.data?.busy?.slice(0, 5),
      start: result.start,
      end: result.end,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown error' },
      { status: 500 }
    )
  }
}
