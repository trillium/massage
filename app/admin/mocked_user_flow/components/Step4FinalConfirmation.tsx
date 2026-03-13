'use client'

import React from 'react'
import MockedConfirmationPage from '../MockedConfirmationPage'
import { AppointmentRequestType } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'

interface Step4FinalConfirmationProps {
  isConfirmed: boolean
  submittedData: AppointmentRequestType | null
}

export default function Step4FinalConfirmation({
  isConfirmed,
  submittedData,
}: Step4FinalConfirmationProps) {
  if (!isConfirmed) {
    return null
  }

  // Transform the data to match MockedConfirmationPage expectations
  const transformedData = submittedData
    ? {
        ...submittedData,
        location:
          submittedData.locationString ||
          (submittedData.locationObject ? flattenLocation(submittedData.locationObject) : ''),
      }
    : null

  return (
    <div
      id="confirmation-section"
      className="rounded-lg bg-surface-50 p-6 shadow dark:bg-surface-800"
    >
      <h2 className="mb-4 text-xl font-semibold text-accent-800 dark:text-accent-200">
        Step 4: Booking Confirmed
      </h2>
      <p className="mb-4 text-accent-600 dark:text-accent-400">
        After approval, the user would see a confirmation page like this:
      </p>
      <MockedConfirmationPage data={transformedData} />
    </div>
  )
}
