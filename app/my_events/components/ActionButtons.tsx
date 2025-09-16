import React from 'react'
import clsx from 'clsx'
import { GoogleCalendarV3Event } from '@/lib/types'
import Link from '@/components/Link'

interface ActionButtonsProps {
  event: GoogleCalendarV3Event
  colorClasses: {
    button: string
  }
  driveTimeLoading: boolean
  onGetDriveTime: () => void
  onRewriteDescription?: () => void
}

export function ActionButtons({
  event,
  colorClasses,
  driveTimeLoading,
  onGetDriveTime,
  onRewriteDescription,
}: ActionButtonsProps) {
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
      {/* Drive Time Button */}
      {event.location && (
        <button
          onClick={onGetDriveTime}
          disabled={driveTimeLoading}
          className={clsx(
            'rounded border px-3 py-1 text-center text-xs transition-colors',
            driveTimeLoading
              ? 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
        >
          {driveTimeLoading ? 'Getting...' : 'Get Drive Time'}
        </button>
      )}
    </div>
  )
}
