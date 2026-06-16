'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { GoogleCalendarV3Event } from '@/lib/types'
import Link from '@/components/Link'
import { ActionButtons } from './ActionButtons'
import { adminFetch } from '@/lib/adminFetch'
import { getCleanSummary } from '@/lib/helpers/eventHelpers'
import { H3 } from '@/components/ui/heading'
import { TextXs, TextXsMedium, TextBase } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface EventCardProps {
  event: GoogleCalendarV3Event
  index: number
  keyPrefix: string
  colorClasses: {
    container: string
    button: string
  }
  canEdit?: boolean
  isPending?: boolean
  token?: string
}

export function EventCard({
  event,
  index,
  keyPrefix,
  colorClasses,
  canEdit = false,
  isPending = false,
  token,
}: EventCardProps) {
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [newLocation, setNewLocation] = useState(event.location || '')
  const [updateLocationLoading, setUpdateLocationLoading] = useState(false)
  const [updateLocationError, setUpdateLocationError] = useState<string | null>(null)
  const [updateLocationSuccess, setUpdateLocationSuccess] = useState(false)

  const formatDate = (dateTime?: string, date?: string) => {
    if (dateTime) {
      return new Date(dateTime).toLocaleString()
    }
    if (date) {
      return new Date(date).toLocaleDateString()
    }
    return 'N/A'
  }

  const handleUpdateLocation = async () => {
    if (!event.id) {
      setUpdateLocationError('Event ID not found')
      return
    }

    setUpdateLocationLoading(true)
    setUpdateLocationError(null)
    setUpdateLocationSuccess(false)

    try {
      const response = await adminFetch('/api/events/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          updateData: {
            location: newLocation,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Failed to update event location'

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || data.message || 'Failed to update event location')
      }

      // Update the event object with the new location
      event.location = newLocation
      setUpdateLocationSuccess(true)
      setIsEditingLocation(false)
    } catch (err) {
      console.error('Error updating event location:', err)
      setUpdateLocationError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUpdateLocationLoading(false)
    }
  }

  const handleCancelLocationEdit = () => {
    setNewLocation(event.location || '')
    setIsEditingLocation(false)
    setUpdateLocationError(null)
    setUpdateLocationSuccess(false)
  }

  const displaySummary = isPending ? getCleanSummary(event) : event.summary || 'Untitled Event'

  return (
    <div
      key={event.id || `${keyPrefix}-${index}`}
      className={clsx('border-l-4 p-4', colorClasses.container)}
    >
      <Stack direction="row" align="start" justify="between">
        <div className="flex-1">
          <Stack direction="row" align="center" gap={2}>
            <H3 className="dark:text-white">{displaySummary}</H3>
            {isPending && (
              <TextXsMedium className="rounded-full bg-amber-200 px-2 py-0.5 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                Pending
              </TextXsMedium>
            )}
          </Stack>

          <div className="mt-2 space-y-1 text-sm text-accent-600 dark:text-accent-400">
            <TextBase>
              <strong>Start:</strong> {formatDate(event.start?.dateTime, event.start?.date)}
            </TextBase>
            <TextBase>
              <strong>End:</strong> {formatDate(event.end?.dateTime, event.end?.date)}
            </TextBase>

            {/* Location with edit functionality */}
            <Box>
              <strong>Location:</strong>{' '}
              {!isEditingLocation ? (
                <span>
                  {event.location || 'No location specified'}
                  {canEdit && (
                    <Button
                      onClick={() => setIsEditingLocation(true)}
                      className="ml-2 text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </Button>
                  )}
                </span>
              ) : (
                <div className="mt-1 space-y-2">
                  <Input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="block w-full rounded border border-accent-300 px-2 py-1 text-sm dark:border-accent-600 dark:bg-surface-700 dark:text-white"
                    placeholder="Enter new location..."
                  />
                  <Stack className="space-x-2" direction="row">
                    <Button
                      onClick={handleUpdateLocation}
                      disabled={updateLocationLoading}
                      className={clsx(
                        'rounded px-2 py-1 text-xs text-white transition-colors',
                        updateLocationLoading
                          ? 'cursor-not-allowed bg-surface-400'
                          : 'bg-green-600 hover:bg-green-700'
                      )}
                    >
                      {updateLocationLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={handleCancelLocationEdit}
                      className="rounded bg-surface-400 px-2 py-1 text-xs text-white hover:bg-surface-950"
                    >
                      Cancel
                    </Button>
                  </Stack>
                </div>
              )}
            </Box>

            {event.creator && (
              <TextBase>
                <strong>Created by:</strong> {event.creator.displayName || event.creator.email}
              </TextBase>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <TextBase>
                <strong>Attendees:</strong>{' '}
                {event.attendees
                  .map((attendee) => attendee.displayName || attendee.email)
                  .join(', ')}
              </TextBase>
            )}

            {/* Status Messages */}
            {updateLocationError && (
              <TextXs status="error">
                <strong>Location Update Error:</strong> {updateLocationError}
              </TextXs>
            )}

            {updateLocationSuccess && (
              <TextXs status="success">
                <strong>Success:</strong> Location updated successfully
              </TextXs>
            )}
          </div>

          {!isPending && event.description && (
            <div className="mt-3">
              <strong className="text-sm text-accent-700 dark:text-accent-300">Description:</strong>
              <div
                className="mt-1 text-sm whitespace-pre-wrap text-accent-600 dark:text-accent-400"
                dangerouslySetInnerHTML={{
                  __html:
                    event.description.length > 200
                      ? `${event.description.substring(0, 200)}...`
                      : event.description,
                }}
              />
            </div>
          )}
        </div>

        <ActionButtons
          event={event}
          colorClasses={colorClasses}
          isPending={isPending}
          token={token}
        />
      </Stack>
    </div>
  )
}
