import { getEventsBySearchQuery } from 'lib/availability/getEventsBySearchQuery'
import { loadGoogleCredentials } from '@/lib/google/credentials'
import { GoogleCalendarV3Event } from 'lib/types'
import { subWeeks, addWeeks, parseISO, isValid } from 'date-fns'
import { CategorizedEventList } from 'app/my_events/components/EventComponents'
import SectionContainer from '@/components/SectionContainer'
import pagesData from '@/data/pages.json'
import { TextSmMedium } from '@/components/ui/text'

const adminText = pagesData.adminPage

function parseDateParam(param: string | string[] | undefined, fallback: Date): string {
  if (param && typeof param === 'string' && isValid(parseISO(param))) return param
  return fallback.toISOString()
}

async function isGoogleConnected(): Promise<boolean> {
  try {
    return (await loadGoogleCredentials()) !== null
  } catch {
    return false
  }
}

async function fetchEvents(start: string, end: string): Promise<GoogleCalendarV3Event[]> {
  try {
    return await getEventsBySearchQuery({ query: 'massage', start, end })
  } catch {
    return []
  }
}

function GoogleNotConnectedBanner() {
  return (
    <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
      <TextSmMedium status="warning">
        {adminText.noConnectionBanner}{' '}
        <a href="/admin/connect-google" className="underline hover:no-underline">
          {adminText.connectNow}
        </a>
      </TextSmMedium>
    </div>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolved = searchParams ? await searchParams : {}
  const now = new Date()
  const startDate = parseDateParam(resolved.startDate, subWeeks(now, 2))
  const endDate = parseDateParam(resolved.endDate, addWeeks(now, 2))

  const [googleConnected, events] = await Promise.all([
    isGoogleConnected(),
    fetchEvents(startDate, endDate),
  ])

  return (
    <SectionContainer>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {!googleConnected && <GoogleNotConnectedBanner />}
        <CategorizedEventList events={events} />
      </div>
    </SectionContainer>
  )
}
