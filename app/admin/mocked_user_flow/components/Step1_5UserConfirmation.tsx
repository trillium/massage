'use client'

import React from 'react'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import BookSessionButton from 'components/BookSessionButton'
import { BookedCard } from 'components/BookedCard'
import { AppointmentRequestType } from '@/lib/schema'

interface Step1_5UserConfirmationProps {
  submittedData: AppointmentRequestType | null
}

export default function Step1_5UserConfirmation({ submittedData }: Step1_5UserConfirmationProps) {
  if (!submittedData) {
    return null
  }

  // Format the time data for display
  let dateString = ''
  let startString = ''
  let endString = ''

  if (submittedData.start && submittedData.timeZone) {
    const start = new Date(submittedData.start)
    const end = new Date(submittedData.end)

    dateString = formatLocalDate(start.toISOString(), { timeZone: submittedData.timeZone })
    startString = formatLocalTime(start.toISOString(), { timeZone: submittedData.timeZone })
    endString = formatLocalTime(end.toISOString(), {
      timeZone: submittedData.timeZone,
      timeZoneName: 'shortGeneric',
    })
  }

  const BookedData = {
    dateString: dateString,
    startString: startString,
    endString: endString,
    state: 'Pending' as const,
    firstName: submittedData.firstName || '',
    lastName: submittedData.lastName || '',
    location: submittedData.location || '',
    phone: submittedData.phone || '',
    email: submittedData.email || '',
  }

  return (
    <div className="mb-12 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
        Step 1.5: User Confirmation Page
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        This is what the user sees immediately after submitting their booking request:
      </p>

      {/* Simulated confirmation page content */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-700">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-primary-500 dark:text-primary-400 sm:text-5xl">
            Thanks!
          </h1>
          <p className="mt-6 text-xl font-medium text-gray-800 dark:text-gray-200">
            Your request has been received!
          </p>
          <p className="mt-6 text-xl font-medium text-gray-800 dark:text-gray-200">
            I&apos;ll review the appointment and get back to you shortly!
          </p>
        </div>

        <div className="mt-6">
          <BookedCard {...BookedData} />
        </div>

        <div className="mt-8 flex items-center justify-center">
          <BookSessionButton title="Book Another Session!" href="/" />
        </div>
      </div>
    </div>
  )
}
