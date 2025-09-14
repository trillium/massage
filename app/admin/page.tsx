import { getEventsBySearchQuery } from 'lib/availability/getEventsBySearchQuery'
import { GoogleCalendarV3Event } from 'lib/types'
import { subWeeks, addWeeks } from 'date-fns'
import AdminNav from '@/components/auth/admin/AdminNav'
import URIMaker from '@/components/URIMaker'
import { CategorizedEventList } from 'app/my_events/components/EventComponents'
import SectionContainer from '@/components/SectionContainer'

export default async function Page() {
  const startDate = subWeeks(new Date(), 2).toISOString()
  const endDate = addWeeks(new Date(), 2).toISOString()

  const events: GoogleCalendarV3Event[] = await getEventsBySearchQuery({
    query: 'massage',
    start: startDate,
    end: endDate,
  })
  return (
    <SectionContainer>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <AdminNav gridCols="gap-3 md:grid-cols-2 lg:grid-cols-4" />
        <div className="flex flex-col items-center">
          <URIMaker events={events} />
        </div>
        <CategorizedEventList events={events} />
      </div>
    </SectionContainer>
  )
}
