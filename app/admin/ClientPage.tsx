'use client'

import URIMaker from '@/components/URIMaker'
import AdminNav from '@/components/auth/admin/AdminNav'
import type { GoogleCalendarV3Event } from 'lib/types'

export default function ClientPage({ events }: { events: GoogleCalendarV3Event[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <AdminNav gridCols="gap-3 md:grid-cols-2 lg:grid-cols-4" />
      <div className="flex flex-col items-center">
        <URIMaker events={events} />
      </div>
    </div>
  )
}
