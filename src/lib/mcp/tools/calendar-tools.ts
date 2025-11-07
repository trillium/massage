import type { z } from 'zod'
import type { getCalendarEventsSchema } from '../schemas'
import { getEventsBySearchQuery } from '@/lib/availability/getEventsBySearchQuery'

export async function getCalendarEvents(args: z.infer<typeof getCalendarEventsSchema>) {
  const { query, startDate, endDate } = args

  const events = await getEventsBySearchQuery({
    query: query || '',
    start: startDate,
    end: endDate,
  })

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(events, null, 2),
      },
    ],
  }
}
