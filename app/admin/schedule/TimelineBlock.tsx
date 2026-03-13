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
            ? 'border-accent-200 bg-surface-100 text-accent-400 opacity-40 dark:border-accent-700 dark:bg-surface-800/30 dark:text-accent-600'
            : 'border-accent-300 bg-surface-100 text-accent-500 dark:border-accent-600 dark:bg-surface-800/50 dark:text-accent-400'
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
            ? 'border-l-accent-300 bg-surface-200 opacity-50 dark:border-l-accent-600 dark:bg-surface-800'
            : 'border-l-green-500 bg-surface-50 shadow-sm dark:bg-surface-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-accent-900 dark:text-accent-100">{name}</span>
        <span className="text-xs text-accent-500 dark:text-accent-400">{duration}</span>
      </div>
      <div className="mt-1 text-sm text-accent-600 dark:text-accent-300">{timeLabel}</div>
      {block.event?.location && (
        <div className="mt-0.5 text-xs text-accent-400 dark:text-accent-500">
          {block.event.location}
        </div>
      )}
    </div>
  )
}
