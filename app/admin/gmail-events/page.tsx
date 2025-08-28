'use client'

import { useState, useEffect } from 'react'
import Calendar from '@/components/availability/date/Calendar'
import TimeButton from '@/components/availability/time/TimeButton'
import Day from '@/lib/day'
import type { StringDateTimeInterval, LocationObject } from '@/lib/types'
import clsx from 'clsx'
import { generateTimeSlots } from './generateTimeSlots'

interface BookingResponse {
  success: boolean
  count: number
  daysSearched: number
  error?: string
  bookings: Array<{
    clientName?: string
    sessionType?: string
    duration?: string
    isCouples?: boolean
    location?: string
    payout?: string
    tip?: string
    notes?: string
    extraServices?: string[]
    messageId: string
    date: string
    subject: string
  }>
}

export default function GmailTestPage() {
  const [bookings, setBookings] = useState<BookingResponse['bookings']>([
    {
      clientName: 'Olivia Mathis',
      sessionType: 'Swedish',
      duration: '60', // Convert to string
      isCouples: true,
      location: '5743 North Canvas Court, North Hollywood\nLos Angeles, CA 91601',
      payout: '83', // Convert to string
      tip: '0', // Convert to string
      extraServices: [], // Ensure type matches string[]
      messageId: '', // Add required fields
      date: '',
      subject: '',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [maxResults, setMaxResults] = useState(25)
  const [daysBack, setDaysBack] = useState(1)

  // New state for tracking booking selections
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse['bookings'][0] | null>(
    null
  )
  const [selectedDay, setSelectedDay] = useState<Day | null>(null)
  const [selectedTime, setSelectedTime] = useState<StringDateTimeInterval | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string>('')

  useEffect(() => {
    if (bookings.length > 0) {
      const booking = bookings[0]
      setSelectedBooking(booking)
      setSelectedLocation(booking.location || '')
    }
  }, [bookings])

  // Handler functions for selections
  const handleDaySelect = (day: Day) => {
    setSelectedDay(day)
  }

  const handleTimeSelect = (time: StringDateTimeInterval, location?: LocationObject) => {
    setSelectedTime(time)
  }

  const handleBookingSelect = (booking: BookingResponse['bookings'][0]) => {
    setSelectedBooking(booking)
    setSelectedLocation(booking.location || '')
  }

  const timeSlots = generateTimeSlots({ selectedDay, selectedBooking })

  const searchSootheEmails = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/admin/gmail/soothe-bookings?maxResults=${maxResults}&daysBack=${daysBack}`
      )
      const data: BookingResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search emails')
      }

      setBookings(data.bookings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAppointmentCreation = async () => {
    if (!selectedBooking || !selectedDay || !selectedTime || !selectedLocation) {
      alert('Please ensure all selections are made before creating an appointment')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Parse the date string from Day.toString() which returns 'YYYY-MM-DD'
      const dateString = selectedDay.toString()
      const [year, month, day] = dateString.split('-').map(Number)

      console.log({
        booking: selectedBooking,
        selectedTime,
        selectedLocation,
        selectedDay: {
          year,
          month,
          day,
          toString: () => dateString,
        },
      })

      const response = await fetch('/api/admin/create-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking: selectedBooking,
          selectedTime,
          selectedLocation,
          selectedDay: {
            year,
            month,
            day,
            toString: () => dateString,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create appointment')
      }

      // Success! Show confirmation
      alert(
        `Appointment created successfully!\n\nEvent ID: ${result.event.id}\nCalendar Link: ${result.event.htmlLink}`
      )

      // Optional: Reset selections after successful creation
      setSelectedBooking(null)
      setSelectedDay(null)
      setSelectedTime(null)
      setSelectedLocation('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-2 p-2">
      <div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Gmail Soothe Booking Search
        </h1>

        <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="mb-2 grid grid-cols-3 gap-2">
            <div>
              <label
                htmlFor="maxResults"
                className="mb-1 block text-sm font-medium text-blue-700 dark:text-blue-300"
              >
                Max Results
              </label>
              <input
                id="maxResults"
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value) || 25)}
                min="1"
                max="100"
                className="w-full rounded-md border border-blue-300 px-3 py-2 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-100"
              />
            </div>
            <div>
              <label
                htmlFor="daysBack"
                className="mb-1 block text-sm font-medium text-blue-700 dark:text-blue-300"
              >
                Days Back
              </label>
              <input
                id="daysBack"
                type="number"
                value={daysBack}
                onChange={(e) => setDaysBack(parseInt(e.target.value) || 1)}
                min="1"
                max="30"
                className="w-full rounded-md border border-blue-300 px-3 py-2 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-100"
              />
            </div>
            <div>
              <label
                htmlFor="daysBack"
                className="mb-1 block text-sm font-medium text-blue-700 dark:text-blue-300"
              >
                Submit that searchSootheEmails
              </label>
              <button
                onClick={searchSootheEmails}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Searching...' : 'Search Soothe Emails'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h3 className="mb-2 font-medium text-red-800 dark:text-red-200">Error:</h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          {error.includes('Gmail API has not been used') && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              <p>
                <strong>Gmail API needs to be enabled:</strong>
              </p>
              <ol className="mt-1 list-inside list-decimal space-y-1">
                <li>
                  <a
                    href="https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=839526851406"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Click here to enable Gmail API
                  </a>
                </li>
                <li>Click "Enable" and wait a few minutes</li>
                <li>Try again</li>
              </ol>
            </div>
          )}
        </div>
      )}

      <CurrentSelection
        {...{
          selectedBooking,
          selectedDay,
          selectedTime,
          selectedLocation: selectedBooking?.location ?? '',
          handleAppointmentCreation,
          loading,
        }}
      />

      <Calendar
        onDaySelect={handleDaySelect}
        forceEnableFutureDates={true}
        selectedDate={selectedDay}
      />

      {bookings.length > 0 && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking, index) => (
              <BookingItem
                key={index}
                booking={booking}
                setActive={handleBookingSelect}
                active={selectedBooking === booking}
              />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((timeSlot, index) => (
              <TimeButton
                key={`${timeSlot.start}-${timeSlot.end}`}
                time={timeSlot}
                active={
                  selectedTime?.start === timeSlot.start && selectedTime?.end === timeSlot.end
                }
                timeZone="America/Los_Angeles"
                onTimeSelect={handleTimeSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BookingItem({ booking, setActive, active }) {
  return (
    <button
      className={clsx('relative rounded-lg border-2 bg-white p-4 shadow-sm dark:bg-gray-800', {
        'border-primary-500 dark:border-primary-500': active,
        'border-gray-200 dark:border-gray-700': !active,
      })}
      onClick={() => setActive(booking)}
    >
      <div className="space-y-3">
        {booking.clientName && (
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{booking.clientName}</p>
          </div>
        )}

        {booking.sessionType && (
          <div>
            <p className="text-gray-900 dark:text-gray-100">
              {booking.duration && `${booking.duration}m - `}
              {booking.sessionType}
              {booking.isCouples && (
                <span className="ml-2 rounded bg-pink-100 px-2 py-1 text-xs text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                  Couples
                </span>
              )}
            </p>
          </div>
        )}

        {booking.location && (
          <div>
            <p className="text-sm whitespace-pre-line text-gray-900 dark:text-gray-100">
              {booking.location}
            </p>
          </div>
        )}

        {(booking.payout || booking.tip) && (
          <div>
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Total: ${parseInt(booking.payout) + parseInt(booking.tip)}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">-</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ${booking.payout}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">+</span>

              <span className="text-green-600 dark:text-green-400">${String(booking.tip)}</span>
            </div>
          </div>
        )}

        {booking.notes && (
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-100">{booking.notes}</p>
          </div>
        )}

        {booking.extraServices && booking.extraServices.length > 0 && (
          <div>
            <div className="mt-1 flex flex-wrap gap-1">
              {booking.extraServices.map((service, serviceIndex) => (
                <span
                  key={serviceIndex}
                  className="inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

function CurrentSelection(props: {
  selectedBooking: BookingResponse['bookings'][0] | null
  selectedDay: Day | null
  selectedTime: StringDateTimeInterval | null
  selectedLocation: string
  handleAppointmentCreation: () => void
  loading: boolean
}) {
  const {
    selectedBooking,
    selectedDay,
    selectedTime,
    selectedLocation,
    handleAppointmentCreation,
    loading,
  } = props
  const anyUnset = !selectedBooking || !selectedDay || !selectedTime || !selectedLocation
  return (
    <div
      className={clsx(
        'relative mt-8 rounded-lg border p-4',
        anyUnset
          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
      )}
    >
      <h3
        className={clsx(
          'mb-4 text-lg font-semibold',
          anyUnset ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'
        )}
      >
        Current Selections
      </h3>

      <div className="space-y-3 text-sm">
        <div>
          <strong
            className={clsx(
              anyUnset ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'
            )}
          >
            Selected Booking:
          </strong>
          <div
            className={clsx(
              'mt-1',
              anyUnset ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            )}
          >
            {selectedBooking ? (
              <>
                <p>
                  {selectedBooking.clientName} - {selectedBooking.sessionType}
                </p>
                <p>Duration: {selectedBooking.duration}m</p>
                <p>Location: {selectedBooking.location}</p>
              </>
            ) : (
              'None selected'
            )}
          </div>
        </div>

        <div>
          <strong
            className={clsx(
              anyUnset ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'
            )}
          >
            Selected Time:
          </strong>
          <div
            className={clsx(
              'mt-1',
              anyUnset ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            )}
          >
            {selectedTime ? (
              <>
                <p>
                  {new Date(selectedTime.start).toLocaleString('en-US', {
                    timeZone: 'America/Los_Angeles',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' - '}
                  {new Date(selectedTime.end).toLocaleString('en-US', {
                    timeZone: 'America/Los_Angeles',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                {selectedLocation && <p>Location: {selectedLocation}</p>}
              </>
            ) : (
              'None selected'
            )}
          </div>
        </div>

        {!anyUnset && (
          <div className="absolute top-1 right-1 flex flex-row rounded bg-green-100 p-2 dark:bg-green-800/20">
            <div>
              <strong className="text-green-800 dark:text-green-200">
                Ready to create booking!
              </strong>
              <p className="mt-1 text-green-700 dark:text-green-300">
                All required information has been selected. You can now create the appointment.
              </p>
            </div>
            <button
              className="bg-primary-500 border-primary-600 m-2 cursor-pointer rounded-md border-2 p-2 font-semibold disabled:cursor-not-allowed disabled:bg-gray-300"
              onClick={handleAppointmentCreation}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
