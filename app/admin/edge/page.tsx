import { Metadata } from 'next'
import SectionContainer from '@/components/SectionContainer'
import { fetchAllCalendarEvents, filterEventsForQuery } from '@/lib/fetch/fetchContainersByQuery'
import { EDGE_BLOCKING_CONTAINERS } from '@/lib/slugConfigurations/slugs/edge'
import { H1, H2, H3 } from '@/components/ui/heading'
import { TextBase, TextSm, TextBaseMedium, TextBaseSemibold } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
import { Badge } from '@/components/ui/badge'
import CustomLink from '@/components/Link'
import { formatLocalDate, formatLocalTime } from '@/lib/availability/helpers'
import { GoogleCalendarV3Event } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edge Event — Admin',
  description: 'Edge event session tracking and availability',
}

const EDGE_BUDGET_MINUTES = 600
const TIMEZONE = 'America/Los_Angeles'

function minutesToHoursLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function getDurationMinutes(event: GoogleCalendarV3Event): number {
  const start = event.start?.dateTime
  const end = event.end?.dateTime
  if (!start || !end) return 0
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
}

function SessionRow({ event, label }: { event: GoogleCalendarV3Event; label: string }) {
  const start = event.start?.dateTime
  const duration = getDurationMinutes(event)
  const dateStr = start ? formatLocalDate(start, { timeZone: TIMEZONE }) : '—'
  const timeStr = start ? formatLocalTime(start, { timeZone: TIMEZONE }) : '—'

  return (
    <Stack
      direction="row"
      align="center"
      justify="between"
      className="rounded border border-surface-200 bg-white px-4 py-3 dark:border-surface-700 dark:bg-surface-900"
    >
      <Stack direction="col">
        <TextBaseMedium>{event.summary}</TextBaseMedium>
        <TextSm status="muted">
          {dateStr}
          {' at '}
          {timeStr}
        </TextSm>
      </Stack>
      <Stack direction="row" align="center" gap={3}>
        <Badge variant="default">{label}</Badge>
        <TextSm status="secondary" className="tabular-nums">
          {minutesToHoursLabel(duration)}
        </TextSm>
      </Stack>
    </Stack>
  )
}

export default async function EdgeAdminPage() {
  let officeHoursMembers: GoogleCalendarV3Event[] = []
  let officeHoursContainers: GoogleCalendarV3Event[] = []
  let destinationMembers: GoogleCalendarV3Event[] = []
  let destinationContainers: GoogleCalendarV3Event[] = []

  try {
    const { allEvents } = await fetchAllCalendarEvents({ searchParams: {} })
    const ohFiltered = filterEventsForQuery(allEvents, EDGE_BLOCKING_CONTAINERS[0])
    const dstFiltered = filterEventsForQuery(allEvents, EDGE_BLOCKING_CONTAINERS[1])
    officeHoursMembers = ohFiltered.members
    officeHoursContainers = ohFiltered.containers
    destinationMembers = dstFiltered.members
    destinationContainers = dstFiltered.containers
  } catch {
    // calendar unavailable — show empty state
  }

  const ohMinutes = officeHoursMembers.reduce((sum, e) => sum + getDurationMinutes(e), 0)
  const dstMinutes = destinationMembers.reduce((sum, e) => sum + getDurationMinutes(e), 0)
  const totalUsedMinutes = ohMinutes + dstMinutes
  const remainingMinutes = Math.max(0, EDGE_BUDGET_MINUTES - totalUsedMinutes)
  const pctUsed = Math.min(100, Math.round((totalUsedMinutes / EDGE_BUDGET_MINUTES) * 100))

  const allContainers = [
    ...officeHoursContainers.map((e) => ({ event: e, label: 'office hours' })),
    ...destinationContainers.map((e) => ({ event: e, label: 'destination' })),
  ].sort((a, b) => {
    const aStart = a.event.start?.dateTime ?? ''
    const bStart = b.event.start?.dateTime ?? ''
    return aStart.localeCompare(bStart)
  })

  return (
    <SectionContainer>
      <Box className="mx-auto max-w-3xl px-4 py-8">
        <H1 className="mb-6">{'Edge Event — Session Tracker'}</H1>

        <Box className="mb-8 rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-700 dark:bg-surface-900">
          <H2 className="mb-4">{'Budget'}</H2>
          <Stack direction="row" align="end" gap={2} className="mb-3">
            <H3>{minutesToHoursLabel(totalUsedMinutes)}</H3>
            <TextBase status="muted">
              {'of '}
              {minutesToHoursLabel(EDGE_BUDGET_MINUTES)}
              {' used'}
            </TextBase>
          </Stack>

          <Box className="h-3 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
            <Box
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${pctUsed}%` }}
            />
          </Box>

          <Stack direction="row" justify="between" className="mt-2">
            <TextSm status="muted">
              {pctUsed}
              {'% used'}
            </TextSm>
            <TextSm status="muted">
              {minutesToHoursLabel(remainingMinutes)}
              {' remaining'}
            </TextSm>
          </Stack>

          <Stack direction="row" gap={6} className="mt-4">
            <Box>
              <TextSm status="muted">{'Office hours'}</TextSm>
              <TextBaseSemibold>{minutesToHoursLabel(ohMinutes)}</TextBaseSemibold>
              <TextSm status="muted">
                {officeHoursMembers.length}
                {' sessions'}
              </TextSm>
            </Box>
            <Box>
              <TextSm status="muted">{'Destination'}</TextSm>
              <TextBaseSemibold>{minutesToHoursLabel(dstMinutes)}</TextBaseSemibold>
              <TextSm status="muted">
                {destinationMembers.length}
                {' sessions'}
              </TextSm>
            </Box>
          </Stack>
        </Box>

        <Box className="mb-8">
          <H2 className="mb-3">{'Scheduled availability windows'}</H2>
          {allContainers.length === 0 ? (
            <Box className="rounded-lg border border-surface-200 p-6 text-center dark:border-surface-700">
              <TextBase status="secondary">
                {'No containers created yet. Use '}
                <CustomLink
                  href="/admin/create-container"
                  classes="text-primary-600 hover:underline"
                >
                  {'Create Container'}
                </CustomLink>{' '}
                {'to add office hours or destination session windows.'}
              </TextBase>
            </Box>
          ) : (
            <Stack direction="col" gap={2}>
              {allContainers.map(({ event, label }) => (
                <SessionRow key={event.id} event={event} label={label} />
              ))}
            </Stack>
          )}
        </Box>

        {(officeHoursMembers.length > 0 || destinationMembers.length > 0) && (
          <Box>
            <H2 className="mb-3">{'Booked sessions'}</H2>
            <Stack direction="col" gap={2}>
              {officeHoursMembers.map((e) => (
                <SessionRow key={e.id} event={e} label="office hours" />
              ))}
              {destinationMembers.map((e) => (
                <SessionRow key={e.id} event={e} label="destination" />
              ))}
            </Stack>
          </Box>
        )}

        <Box className="mt-8 rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900">
          <H3 status="muted" className="mb-1">
            {'Links'}
          </H3>
          <Stack direction="col" gap={1}>
            <CustomLink href="/edge" classes="text-primary-600 hover:underline">
              {'/edge — guest landing page'}
            </CustomLink>
            <CustomLink href="/edge-office-hours" classes="text-primary-600 hover:underline">
              {'/edge-office-hours — office hours booking'}
            </CustomLink>
            <CustomLink href="/edge-destination" classes="text-primary-600 hover:underline">
              {'/edge-destination — destination session booking'}
            </CustomLink>
            <CustomLink href="/admin/create-container" classes="text-primary-600 hover:underline">
              {'/admin/create-container — add availability window'}
            </CustomLink>
          </Stack>
        </Box>
      </Box>
    </SectionContainer>
  )
}
