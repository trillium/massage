'use client'

import type { TimelineBlockData } from './computeTimelineBlocks'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getAttendeeName(block: TimelineBlockData): string {
  const event = block.event
  if (!event) return ''
  const attendee = event.attendees?.find((a) => !a.self && !a.organizer)
  if (attendee?.displayName) return attendee.displayName
  if (attendee?.email) return attendee.email.split('@')[0]
  const summary = event.summary || ''
  return summary.replace(/__EVENT__.*/, '').trim() || 'Booked'
}

type Props = {
  block: TimelineBlockData
  isPast: boolean
  isInProgress: boolean
}

export function TimelineBlock({ block, isPast, isInProgress }: Props) {
  const timeLabel = `${formatTime(block.start)} – ${formatTime(block.end)}`
  const duration = `${block.durationMinutes}m`

  if (block.type === 'gap') {
    return (
      <div
        className={`flex min-h-[44px] items-center justify-between rounded-md border border-dashed px-3 py-2 ${
          isPast
            ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-40 dark:border-gray-700 dark:bg-gray-800/30 dark:text-gray-600'
            : 'border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-400'
        }`}
      >
        <span className="text-sm">{block.durationMinutes} min open</span>
        <span className="text-xs">{timeLabel}</span>
      </div>
    )
  }

  const name = getAttendeeName(block)

  return (
    <div
      className={`min-h-[44px] rounded-md border-l-4 px-3 py-2 ${
        isInProgress
          ? 'border-l-blue-500 bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/30 dark:ring-blue-400'
          : isPast
            ? 'border-l-gray-300 bg-gray-100 opacity-50 dark:border-l-gray-600 dark:bg-gray-800'
            : 'border-l-green-500 bg-white shadow-sm dark:bg-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900 dark:text-gray-100">{name}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{duration}</span>
      </div>
      <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{timeLabel}</div>
      {block.event?.location && (
        <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
          {block.event.location}
        </div>
      )}
    </div>
  )
}
