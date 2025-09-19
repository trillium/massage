'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import { GoogleCalendarV3Event } from '@/lib/types'
import { UserAuthManager } from '@/lib/userAuth'
import { CategorizedEventList } from './EventComponents'
import { identifyAuthenticatedUser } from '@/lib/posthog-utils'

export default function MyEventsPageClient() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [events, setEvents] = useState<GoogleCalendarV3Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  // Verify email and token from URL parameters or existing session
  useEffect(() => {
    const verifyAccess = async () => {
      console.log('🔍 Starting verification process')

      // First, check for existing valid session
      const existingSession = UserAuthManager.validateSession()
      console.log(
        '📋 Existing session check:',
        existingSession ? 'Found valid session' : 'No valid session'
      )

      if (existingSession) {
        console.log('✅ Using existing session for:', existingSession.email)
        // Add identification
        await identifyAuthenticatedUser(existingSession.email, 'session')
        setIsVerified(true)
        setEmail(existingSession.email)
        setVerificationError(null)
        return
      }

      // If no session, check URL params
      const urlEmail = searchParams.get('email')
      const urlToken = searchParams.get('token')
      console.log('🔗 URL params:', { email: urlEmail, tokenPresent: !!urlToken })

      if (!urlEmail || !urlToken) {
        console.log('❌ Missing URL params')
        setVerificationError(
          'Missing email or verification token in URL. Please use the secure link from your email.'
        )
        return
      }

      try {
        console.log('📡 Making server validation request')

        const response = await fetch('/api/user/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: urlEmail, token: urlToken }),
        })

        console.log('📡 Server response status:', response.status)

        const result = await response.json()
        console.log('📡 Server response body:', result)

        if (result.valid) {
          console.log('✅ Server validation passed, creating session')

          const sessionCreated = UserAuthManager.createSession(urlEmail, urlToken, true)
          console.log('💾 Session creation result:', sessionCreated)

          if (sessionCreated) {
            // Clean URL by removing auth parameters
            const cleanUrl = new URL(window.location.href)
            cleanUrl.searchParams.delete('email')
            cleanUrl.searchParams.delete('token')
            window.history.replaceState({}, '', cleanUrl.pathname)
            console.log('🧹 URL cleaned')

            // Add identification
            await identifyAuthenticatedUser(urlEmail, 'token')
            setIsVerified(true)
            setEmail(urlEmail)
            setVerificationError(null)
            console.log('🎉 Verification complete')
          } else {
            console.error('❌ Failed to create session')
            setVerificationError('Failed to create user session.')
          }
        } else {
          console.log('❌ Server validation failed')
          setVerificationError(
            'Invalid verification token. Please use the secure link provided in your email.'
          )
        }
      } catch (error) {
        console.error('💥 Token verification error:', error)
        setVerificationError('Error verifying email. Please try again or contact support.')
      }
    }

    verifyAccess()
  }, [searchParams])

  const searchEvents = useCallback(async () => {
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
  }, [email, isVerified])

  // Automatically search events when email is verified
  useEffect(() => {
    if (isVerified && email) {
      searchEvents()
    }
  }, [isVerified, email, searchEvents])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">My Events</h1>

          {!isVerified ? (
            <VerificationRequired verificationError={verificationError} />
          ) : (
            <EventsSection
              email={email}
              loading={loading}
              error={error}
              hasSearched={hasSearched}
              events={events}
              searchEvents={searchEvents}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function VerificationRequired({ verificationError }: { verificationError: string | null }) {
  return (
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
              To access your events securely, you need to use the verification link sent to your
              email.
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
  )
}

function EventsSection({
  email,
  loading,
  error,
  hasSearched,
  events,
  searchEvents,
}: {
  email: string
  loading: boolean
  error: string | null
  hasSearched: boolean
  events: GoogleCalendarV3Event[]
  searchEvents: () => void
}) {
  return (
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
          <p className="font-medium text-green-700 dark:text-green-300">Email verified: {email}</p>
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
              <p className="text-gray-600 dark:text-gray-400">No events found for "{email}"</p>
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
  )
}
