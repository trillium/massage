'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { GoogleCalendarV3Event } from '@/lib/types'
import Link from '@/components/Link'
import { ActionButtons } from './ActionButtons'
import { adminFetch } from '@/lib/adminFetch'
import { getCleanSummary } from '@/lib/helpers/eventHelpers'

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
}

export function EventCard({
  event,
  index,
  keyPrefix,
  colorClasses,
  canEdit = false,
  isPending = false,
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
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {displaySummary}
            </h3>
            {isPending && (
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                Pending
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Start:</strong> {formatDate(event.start?.dateTime, event.start?.date)}
            </p>
            <p>
              <strong>End:</strong> {formatDate(event.end?.dateTime, event.end?.date)}
            </p>

            {/* Location with edit functionality */}
            <div>
              <strong>Location:</strong>{' '}
              {!isEditingLocation ? (
                <span>
                  {event.location || 'No location specified'}
                  {canEdit && (
                    <button
                      onClick={() => setIsEditingLocation(true)}
                      className="ml-2 text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                  )}
                </span>
              ) : (
                <div className="mt-1 space-y-2">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="block w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter new location..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateLocation}
                      disabled={updateLocationLoading}
                      className={clsx(
                        'rounded px-2 py-1 text-xs text-white transition-colors',
                        updateLocationLoading
                          ? 'cursor-not-allowed bg-gray-400'
                          : 'bg-green-600 hover:bg-green-700'
                      )}
                    >
                      {updateLocationLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelLocationEdit}
                      className="rounded bg-gray-400 px-2 py-1 text-xs text-white hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {event.creator && (
              <p>
                <strong>Created by:</strong> {event.creator.displayName || event.creator.email}
              </p>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <p>
                <strong>Attendees:</strong>{' '}
                {event.attendees
                  .map((attendee) => attendee.displayName || attendee.email)
                  .join(', ')}
              </p>
            )}

            {/* Status Messages */}
            {updateLocationError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>Location Update Error:</strong> {updateLocationError}
              </p>
            )}

            {updateLocationSuccess && (
              <p className="text-xs text-green-600 dark:text-green-400">
                <strong>Success:</strong> Location updated successfully
              </p>
            )}
          </div>

          {!isPending && event.description && (
            <div className="mt-3">
              <strong className="text-sm text-gray-700 dark:text-gray-300">Description:</strong>
              <div
                className="mt-1 text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400"
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

        <ActionButtons event={event} colorClasses={colorClasses} isPending={isPending} />
      </div>
    </div>
  )
}
