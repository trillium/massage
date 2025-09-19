import React from 'react'
import clsx from 'clsx'
import { GoogleCalendarV3Event } from '@/lib/types'
import Link from '@/components/Link'

interface ActionButtonsProps {
  event: GoogleCalendarV3Event
  colorClasses: {
    button: string
  }
  onRewriteDescription?: () => void
}

export function ActionButtons({ event, colorClasses, onRewriteDescription }: ActionButtonsProps) {
  return (
    <div className="ml-4 flex flex-col space-y-2">
      <Link
        href={`/event/${event.id}`}
        className={clsx(
          'inline-block rounded px-3 py-1 text-center text-sm text-white transition-colors',
          colorClasses.button
        )}
      >
        View Details
      </Link>
      <button
        onClick={() => console.log('Rebook clicked')}
        className={clsx(
          'rounded px-3 py-1 text-center text-sm text-white transition-colors',
          colorClasses.button
        )}
      >
        Rebook
      </button>
    </div>
  )
}
