import { getEventsBySearchQuery } from 'lib/availability/getEventsBySearchQuery'
import ClientPage from './ClientPage'
import { GoogleCalendarV3Event } from 'lib/types'
import { subWeeks, addWeeks } from 'date-fns'
import AdminNavigation from '@/components/AdminNavigation'
import URIMaker from '@/components/URIMaker'
import { CategorizedEventList } from 'app/my_events/components/EventComponents'

export default async function Page() {
  const startDate = subWeeks(new Date(), 2).toISOString()
  const endDate = addWeeks(new Date(), 2).toISOString()

  const events: GoogleCalendarV3Event[] = await getEventsBySearchQuery({
    query: 'massage',
    start: startDate,
    end: endDate,
  })
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <AdminNavigation />
      <div className="flex flex-col items-center">
        <URIMaker events={events} />
      </div>
      <CategorizedEventList events={events} />
    </div>
  )
}
