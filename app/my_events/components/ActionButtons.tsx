'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { GoogleCalendarV3Event } from '@/lib/types'
import Link from '@/components/Link'
import { extractApprovalUrls } from '@/lib/helpers/eventHelpers'

interface ActionButtonsProps {
  event: GoogleCalendarV3Event
  colorClasses: {
    button: string
  }
  onRewriteDescription?: () => void
  isPending?: boolean
}

export function ActionButtons({
  event,
  colorClasses,
  onRewriteDescription,
  isPending = false,
}: ActionButtonsProps) {
  const [cancelState, setCancelState] = useState<'idle' | 'loading' | 'cancelled' | 'error'>('idle')

  const handleCancelRequest = async () => {
    const { declineUrl } = extractApprovalUrls(event.description)
    if (!declineUrl) {
      setCancelState('error')
      return
    }

    setCancelState('loading')
    try {
      const url = new URL(declineUrl)
      const response = await fetch(url.pathname + url.search)
      if (response.ok) {
        setCancelState('cancelled')
      } else {
        setCancelState('error')
      }
    } catch {
      setCancelState('error')
    }
  }

  if (isPending) {
    if (cancelState === 'cancelled') {
      return (
        <div className="ml-4">
          <span className="text-sm font-medium text-gray-500">Cancelled</span>
        </div>
      )
    }

    return (
      <div className="ml-4">
        <button
          onClick={handleCancelRequest}
          disabled={cancelState === 'loading'}
          className={clsx(
            'rounded px-3 py-1 text-center text-sm text-white transition-colors',
            cancelState === 'loading'
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
          )}
        >
          {cancelState === 'loading' ? 'Cancelling...' : 'Cancel Request'}
        </button>
        {cancelState === 'error' && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">Failed to cancel</p>
        )}
      </div>
    )
  }

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
    </div>
  )
}
