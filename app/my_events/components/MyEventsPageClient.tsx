'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { GoogleCalendarV3Event } from '@/lib/types'
import { UserAuthManager } from '@/lib/userAuth'
import { identifyAuthenticatedUser } from '@/lib/posthog-utils'
import { VerificationRequired } from './VerificationRequired'
import { EventsSection } from './EventsSection'

export default function MyEventsPageClient() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [events, setEvents] = useState<GoogleCalendarV3Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  useEffect(() => {
    const verifyAccess = async () => {
      const existingSession = UserAuthManager.validateSession()

      if (existingSession) {
        await identifyAuthenticatedUser(existingSession.email, 'session')
        setIsVerified(true)
        setEmail(existingSession.email)
        setVerificationError(null)
        return
      }

      const urlEmail = searchParams.get('email')
      const urlToken = searchParams.get('token')

      if (!urlEmail || !urlToken) {
        setVerificationError(
          'Missing email or verification token in URL. Please use the secure link from your email.'
        )
        return
      }

      try {
        const response = await fetch('/api/user/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: urlEmail, token: urlToken }),
        })

        const result = await response.json()

        if (result.valid) {
          const sessionCreated = UserAuthManager.createSession(urlEmail, urlToken)

          if (sessionCreated) {
            const cleanUrl = new URL(window.location.href)
            cleanUrl.searchParams.delete('email')
            cleanUrl.searchParams.delete('token')
            window.history.replaceState({}, '', cleanUrl.pathname)

            await identifyAuthenticatedUser(urlEmail, 'email_verified')
            setIsVerified(true)
            setEmail(urlEmail)
            setVerificationError(null)
          } else {
            console.error('❌ Failed to create session')
            setVerificationError('Failed to create user session.')
          }
        } else {
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
