import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { resolveConfiguration } from '@/lib/slugConfigurations/helpers/resolveConfiguration'
import { isPromoExpired } from '@/lib/utilities/promoValidation'
import {
  getActiveContainers,
  QueryGroup,
} from '../../../../admin/active-event-containers/getActiveContainers'
import { GoogleCalendarV3Event } from '@/lib/types'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authResult = await requireAdminWithFlag(request)
  if (authResult instanceof NextResponse) return authResult

  const { slug } = await params
  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  const errors: string[] = []

  const { configuration } = await resolveConfiguration(slug)
  const exists = configuration.type !== null
  if (!exists) {
    errors.push('Slug not found in configuration')
  }

  const expired = isPromoExpired(configuration.promoEndDate)
  if (expired) {
    errors.push('Promo expired')
  }

  const reachable = exists && !expired

  let containers: {
    found: boolean
    count: number
    upcoming: { summary: string; start: string; end: string }[]
  } | null = null

  if (configuration.eventContainer) {
    try {
      const queryGroups = await getActiveContainers()
      const match = queryGroups.find((g: QueryGroup) => g.query === configuration.eventContainer)

      if (match && match.containers.length > 0) {
        containers = {
          found: true,
          count: match.containers.length,
          upcoming: match.containers.map((e: GoogleCalendarV3Event) => ({
            summary: e.summary || '',
            start: e.start?.dateTime || e.start?.date || '',
            end: e.end?.dateTime || e.end?.date || '',
          })),
        }
      } else {
        containers = { found: false, count: 0, upcoming: [] }
        errors.push(`No container events found for '${configuration.eventContainer}'`)
      }
    } catch (error) {
      console.error('Error fetching containers:', error)
      containers = { found: false, count: 0, upcoming: [] }
      errors.push('Failed to fetch container events from Google Calendar')
    }
  }

  return NextResponse.json({
    slug,
    exists,
    reachable,
    configuration: {
      type: configuration.type,
      title: configuration.title,
      eventContainer: configuration.eventContainer,
      blockingScope: configuration.blockingScope ?? 'event',
      pricing: configuration.pricing,
      allowedDurations: configuration.allowedDurations,
      promoEndDate: configuration.promoEndDate ?? null,
      isExpired: expired,
    },
    containers,
    errors,
  })
}
