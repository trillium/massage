'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import { GoogleCalendarV3Event } from '@/lib/types'
import { getHash } from '@/lib/hash'
import { CategorizedEventList } from './EventComponents'
import Link from '@/components/Link'

interface EventCardProps {
  event: GoogleCalendarV3Event
  index: number
  keyPrefix: string
  colorClasses: {
    container: string
    button: string
  }
}

export function EventCard({ event, index, keyPrefix, colorClasses }: EventCardProps) {
  const [driveTime, setDriveTime] = useState<number | null>(null)
  const [driveTimeLoading, setDriveTimeLoading] = useState(false)
  const [driveTimeError, setDriveTimeError] = useState<string | null>(null)
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

  const handleGetDriveTime = async () => {
    if (!event.location) {
      setDriveTimeError('Event has no location specified')
      return
    }

    setDriveTimeLoading(true)
    setDriveTimeError(null)

    try {
      const response = await fetch('/api/driveTime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userLocation: event.location,
          // Uses DEFAULT_EVENT_ID from the API route
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get drive time')
      }

      setDriveTime(data.driveTimeMinutes)
    } catch (err) {
      console.error('Error fetching drive time:', err)
      setDriveTimeError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setDriveTimeLoading(false)
    }
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
      const response = await fetch('/api/events/update', {
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

      // Clear drive time since location changed
      setDriveTime(null)
      setDriveTimeError(null)
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

  return (
    <div
      key={event.id || `${keyPrefix}-${index}`}
      className={clsx('border-l-4 p-4', colorClasses.container)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {event.summary || 'Untitled Event'}
          </h3>

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
                  <button
                    onClick={() => setIsEditingLocation(true)}
                    className="ml-2 text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </button>
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

            {/* Drive Time Display */}
            {driveTime !== null && (
              <p className="font-medium text-green-600 dark:text-green-400">
                <strong>Drive Time:</strong> {driveTime} minutes from default location
              </p>
            )}

            {/* Status Messages */}
            {driveTimeError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>Drive Time Error:</strong> {driveTimeError}
              </p>
            )}

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

          {event.description && (
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
              onClick={handleGetDriveTime}
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
      </div>
    </div>
  )
}

export default function MyEventsPageClient() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [events, setEvents] = useState<GoogleCalendarV3Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  // Verify email and hash from URL parameters
  useEffect(() => {
    const verifyEmailHash = async () => {
      const urlEmail = searchParams.get('email')
      const urlHash = searchParams.get('hash')

      if (!urlEmail || !urlHash) {
        setVerificationError('Missing email or verification hash in URL')
        return
      }

      try {
        // Verify the hash matches the email
        const expectedHash = await getHash(urlEmail)

        if (expectedHash === urlHash) {
          setIsVerified(true)
          setEmail(urlEmail)
          setVerificationError(null)
        } else {
          setVerificationError(
            'Invalid verification hash. Please use the secure link provided in your email.'
          )
        }
      } catch (error) {
        console.error('Hash verification error:', error)
        setVerificationError('Error verifying email. Please try again or contact support.')
      }
    }

    verifyEmailHash()
  }, [searchParams])

  const searchEvents = async () => {
    if (!email.trim() || !isVerified) {
      setError('Email verification required')
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      // Call the API endpoint to search for events by the verified email
      const response = await fetch(`/api/events/byEmail?email=${encodeURIComponent(email)}`)

      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch events')
      }

      setEvents(data.events)
    } catch (err) {
      console.error('Error searching events:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">My Events</h1>

          {!isVerified ? (
            <div className="rounded-lg bg-yellow-50 p-6 shadow-sm dark:bg-yellow-900/20">
              {verificationError ? (
                <div className="text-center">
                  <div className="mb-4 text-red-600 dark:text-red-400">
                    <svg
                      className="mx-auto mb-4 h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                    Email Verification Required
                  </h2>
                  <p className="mb-4 text-red-600 dark:text-red-400">{verificationError}</p>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      To access your events securely, you need to use the verification link sent to
                      your email.
                    </p>
                    <p>If you don't have this link, please contact support for assistance.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <div className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-green-600 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="font-medium text-green-700 dark:text-green-300">
                    Email verified: {email}
                  </p>
                </div>
              </div>

              <div className="mb-8 rounded-lg bg-gray-50 p-6 shadow-sm dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Search Your Events
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Find all events associated with {email}
                    </p>
                  </div>
                  <button
                    onClick={searchEvents}
                    disabled={loading}
                    className={clsx(
                      'rounded-md px-6 py-2 text-white transition-colors',
                      loading
                        ? 'bg-blue-400 dark:bg-blue-400'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    )}
                  >
                    {loading ? 'Searching...' : 'Search Events'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  <p>{error}</p>
                </div>
              )}

              {hasSearched && !loading && (
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                    Search Results
                  </h2>

                  {events.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        No events found for "{email}"
                      </p>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                        No appointments or events were found for this email address.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Found {events.length} event{events.length !== 1 ? 's' : ''} for "{email}"
                      </p>

                      <CategorizedEventList events={events} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
