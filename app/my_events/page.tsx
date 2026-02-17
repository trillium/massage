import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getEventsBySearchQuery } from '@/lib/availability/getEventsBySearchQuery'
import { CategorizedEventList } from './components/EventComponents'

export default async function MyEventsPage() {
  const user = await getUser()

  if (!user?.email) {
    redirect('/auth/login?redirectedFrom=/my_events')
  }

  const eighteenMonthsAgo = new Date()
  eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18)
  const sixMonthsFromNow = new Date()
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

  const events = await getEventsBySearchQuery({
    query: user.email,
    start: eighteenMonthsAgo,
    end: sixMonthsFromNow,
  })

  const sortedEvents = events.sort((a, b) => {
    const dateA = new Date(a.start?.dateTime || a.start?.date || 0)
    const dateB = new Date(b.start?.dateTime || b.start?.date || 0)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">My Events</h1>
          <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
            Showing appointments for {user.email}
          </p>

          {sortedEvents.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">No appointments found.</p>
            </div>
          ) : (
            <CategorizedEventList events={sortedEvents} />
          )}
        </div>
      </div>
    </div>
  )
}
