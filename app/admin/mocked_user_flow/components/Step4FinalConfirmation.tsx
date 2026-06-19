'use client'

import React from 'react'
import MockedConfirmationPage from '../MockedConfirmationPage'
import { AppointmentRequestType } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { H2 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

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
    <Box
      id="confirmation-section"
      className="rounded-lg bg-surface-50 p-6 shadow dark:bg-surface-800"
    >
      <H2 className="mb-4">{'Step 4: Booking Confirmed'}</H2>
      <TextBase status="secondary" className="mb-4">
        {'After approval, the user would see a confirmation page like this:'}
      </TextBase>
      <MockedConfirmationPage data={transformedData} />
    </Box>
  )
}
