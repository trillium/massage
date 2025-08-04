'use client'

import React from 'react'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import BookSessionButton from 'components/BookSessionButton'
import { BookedCard } from 'components/BookedCard'
import { AppointmentRequestType } from '@/lib/schema'
import ClientConfirmationFeature from '@/features/ClientConfirmationFeature'

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

  return (
    <div className="mb-12 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
        Step 1.5: User Confirmation Page
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        This is what the user sees immediately after submitting their booking request:
      </p>

      {/* Simulated confirmation page content */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-900">
        <ClientConfirmationFeature />
      </div>
    </div>
  )
}
