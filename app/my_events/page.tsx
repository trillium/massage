import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getEventsBySearchQuery } from '@/lib/availability/getEventsBySearchQuery'
import { createEventToken } from '@/lib/eventToken'
import { CategorizedEventList } from './components/EventComponents'
import pagesData from '@/data/pages.json'
import { H1 } from '@/components/ui/heading'
import { TextSmMuted,
  TextBase,
} from '@/components/ui/text'

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

  const eventTokens: Record<string, string> = {}
  for (const event of sortedEvents) {
    if (!event.id) continue
    const endTime = event.end?.dateTime || event.end?.date
    if (!endTime) continue
    eventTokens[event.id] = createEventToken(event.id, user.email, endTime)
  }

  const { myEvents } = pagesData

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <H1 className="mb-2 dark:text-white">{myEvents.heading}</H1>
          <TextSmMuted className="mb-8">
            {myEvents.subtitle} {user.email}
          </TextSmMuted>

          {sortedEvents.length === 0 ? (
            <div className="rounded-lg bg-surface-100 p-8 text-center dark:bg-surface-800">
              <TextBase className="text-accent-600 dark:text-accent-400">{myEvents.empty}</TextBase>
            </div>
          ) : (
            <CategorizedEventList events={sortedEvents} eventTokens={eventTokens} />
          )}
        </div>
      </div>
    </div>
  )
}
