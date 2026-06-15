'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { GoogleCalendarV3Event } from '@/lib/types'
import Link from '@/components/Link'
import { extractApprovalUrls } from '@/lib/helpers/eventHelpers'
import { TextSmMedium, TextXs } from '@/components/ui/text'

import { Button } from '@/components/ui/button'

interface ActionButtonsProps {
  event: GoogleCalendarV3Event
  colorClasses: {
    button: string
  }
  onRewriteDescription?: () => void
  isPending?: boolean
  token?: string
}

export function ActionButtons({
  event,
  colorClasses,
  onRewriteDescription,
  isPending = false,
  token,
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
          <TextSmMedium status="muted">Cancelled</TextSmMedium>
        </div>
      )
    }

    return (
      <div className="ml-4">
        <Button
          onClick={handleCancelRequest}
          disabled={cancelState === 'loading'}
          className={clsx(
            'rounded px-3 py-1 text-center text-sm text-white transition-colors',
            cancelState === 'loading'
              ? 'cursor-not-allowed bg-surface-400'
              : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
          )}
        >
          {cancelState === 'loading' ? 'Cancelling...' : 'Cancel Request'}
        </Button>
        {cancelState === 'error' && (
          <TextXs className="mt-1" status="error">
            Failed to cancel
          </TextXs>
        )}
      </div>
    )
  }

  const containerMatch = event.summary?.match(/^(.+?)__EVENT__CONTAINER__/)
  const detailsHref = containerMatch
    ? `/admin/${containerMatch[1]}`
    : token
      ? `/event/${event.id}?token=${encodeURIComponent(token)}`
      : `/event/${event.id}`

  return (
    <div className="ml-4 flex flex-col space-y-2">
      <Link
        href={detailsHref}
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
