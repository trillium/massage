import { getEventsBySearchQuery } from 'lib/availability/getEventsBySearchQuery'
import { GoogleCalendarV3Event } from 'lib/types'
import { subWeeks, addWeeks } from 'date-fns'
import { CategorizedEventList } from 'app/my_events/components/EventComponents'
import SectionContainer from '@/components/SectionContainer'

import { parseISO, isValid } from 'date-fns'

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  let startDate: string
  let endDate: string
  const startDateParam = resolvedSearchParams.startDate
  const endDateParam = resolvedSearchParams.endDate
  if (startDateParam && typeof startDateParam === 'string' && isValid(parseISO(startDateParam))) {
    startDate = startDateParam
  } else {
    startDate = subWeeks(new Date(), 2).toISOString()
  }
  if (endDateParam && typeof endDateParam === 'string' && isValid(parseISO(endDateParam))) {
    endDate = endDateParam
  } else {
    endDate = addWeeks(new Date(), 2).toISOString()
  }

  const events: GoogleCalendarV3Event[] = await getEventsBySearchQuery({
    query: 'massage',
    start: startDate,
    end: endDate,
  })
  return (
    <SectionContainer>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <CategorizedEventList events={events} />
      </div>
    </SectionContainer>
  )
}
