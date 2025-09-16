'use client'

import URIMaker from '@/components/URIMaker'
import type { GoogleCalendarV3Event } from 'lib/types'

export default function ClientPage({ events }: { events: GoogleCalendarV3Event[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col items-center">
        <URIMaker events={events} />
      </div>
    </div>
  )
}
