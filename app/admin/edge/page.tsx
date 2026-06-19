/* ds-ignore-file */
import { Metadata } from 'next'
import SectionContainer from '@/components/SectionContainer'
import { fetchAllCalendarEvents, filterEventsForQuery } from '@/lib/fetch/fetchContainersByQuery'
import { H1, H2, H3 } from '@/components/ui/heading'
import { TextBase, TextSm, TextLg } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
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
        <TextBase className="font-medium">{event.summary}</TextBase>
        <TextSm className="text-accent-500">
          {dateStr} at {timeStr}
        </TextSm>
      </Stack>
      <Stack direction="row" align="center" gap={3}>
        <Box className="rounded bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
          {label}
        </Box>
        <TextSm className="font-mono text-accent-600 dark:text-accent-400">
          {minutesToHoursLabel(duration)}
        </TextSm>
      </Stack>
    </Stack>
  )
}

export default async function EdgeAdminPage() {
  let officeHoursMembers: GoogleCalendarV3Event[] = []
  let officeHoursContainers: GoogleCalendarV3Event[] = []
  let privateMembers: GoogleCalendarV3Event[] = []
  let privateContainers: GoogleCalendarV3Event[] = []

  try {
    const { allEvents } = await fetchAllCalendarEvents({ searchParams: {} })
    const ohFiltered = filterEventsForQuery(allEvents, 'edge')
    const pvFiltered = filterEventsForQuery(allEvents, 'edge_private')
    officeHoursMembers = ohFiltered.members
    officeHoursContainers = ohFiltered.containers
    privateMembers = pvFiltered.members
    privateContainers = pvFiltered.containers
  } catch {
    // calendar unavailable — show empty state
  }

  const ohMinutes = officeHoursMembers.reduce((sum, e) => sum + getDurationMinutes(e), 0)
  const pvMinutes = privateMembers.reduce((sum, e) => sum + getDurationMinutes(e), 0)
  const totalUsedMinutes = ohMinutes + pvMinutes
  const remainingMinutes = Math.max(0, EDGE_BUDGET_MINUTES - totalUsedMinutes)
  const pctUsed = Math.min(100, Math.round((totalUsedMinutes / EDGE_BUDGET_MINUTES) * 100))

  const allContainers = [
    ...officeHoursContainers.map((e) => ({ event: e, label: 'office hours' })),
    ...privateContainers.map((e) => ({ event: e, label: 'private' })),
  ].sort((a, b) => {
    const aStart = a.event.start?.dateTime ?? ''
    const bStart = b.event.start?.dateTime ?? ''
    return aStart.localeCompare(bStart)
  })

  return (
    <SectionContainer>
      <Box className="mx-auto max-w-3xl px-4 py-8">
        <H1 className="mb-6">Edge Event — Session Tracker</H1>

        <Box className="mb-8 rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-700 dark:bg-surface-900">
          <H2 className="mb-4">Budget</H2>
          <Stack direction="row" align="end" gap={2} className="mb-3">
            <TextLg className="font-bold text-accent-900 dark:text-accent-100">
              {minutesToHoursLabel(totalUsedMinutes)}
            </TextLg>
            <TextBase className="text-accent-400">
              of {minutesToHoursLabel(EDGE_BUDGET_MINUTES)} used
            </TextBase>
          </Stack>

          <Box className="h-3 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
            <Box
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${pctUsed}%` }}
            />
          </Box>

          <Stack direction="row" justify="between" className="mt-2">
            <TextSm className="text-accent-500">{pctUsed}% used</TextSm>
            <TextSm className="text-accent-500">
              {minutesToHoursLabel(remainingMinutes)} remaining
            </TextSm>
          </Stack>

          <Stack direction="row" gap={6} className="mt-4">
            <Box>
              <TextSm className="text-accent-400">Office hours</TextSm>
              <TextBase className="font-semibold">{minutesToHoursLabel(ohMinutes)}</TextBase>
              <TextSm className="text-accent-500">{officeHoursMembers.length} sessions</TextSm>
            </Box>
            <Box>
              <TextSm className="text-accent-400">Private</TextSm>
              <TextBase className="font-semibold">{minutesToHoursLabel(pvMinutes)}</TextBase>
              <TextSm className="text-accent-500">{privateMembers.length} sessions</TextSm>
            </Box>
          </Stack>
        </Box>

        <Box className="mb-8">
          <H2 className="mb-3">Scheduled availability windows</H2>
          {allContainers.length === 0 ? (
            <Box className="rounded-lg border border-surface-200 p-6 text-center dark:border-surface-700">
              <TextBase status="secondary">
                No containers created yet. Use{' '}
                <a href="/admin/create-container" className="text-primary-600 hover:underline">
                  Create Container
                </a>{' '}
                to add office hours or private session windows.
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

        {(officeHoursMembers.length > 0 || privateMembers.length > 0) && (
          <Box>
            <H2 className="mb-3">Booked sessions</H2>
            <Stack direction="col" gap={2}>
              {officeHoursMembers.map((e) => (
                <SessionRow key={e.id} event={e} label="office hours" />
              ))}
              {privateMembers.map((e) => (
                <SessionRow key={e.id} event={e} label="private" />
              ))}
            </Stack>
          </Box>
        )}

        <Box className="mt-8 rounded-lg border border-surface-200 bg-surface-50 p-4 text-sm text-accent-500 dark:border-surface-700 dark:bg-surface-900">
          <H3 className="mb-1 text-accent-400">Links</H3>
          <Stack direction="col" gap={1}>
            <a href="/edge" className="text-primary-600 hover:underline">
              /edge — guest landing page
            </a>
            <a href="/edge-office-hours" className="text-primary-600 hover:underline">
              /edge-office-hours — office hours booking
            </a>
            <a href="/edge-private" className="text-primary-600 hover:underline">
              /edge-private — private session booking
            </a>
            <a href="/admin/create-container" className="text-primary-600 hover:underline">
              /admin/create-container — add availability window
            </a>
          </Stack>
        </Box>
      </Box>
    </SectionContainer>
  )
}
