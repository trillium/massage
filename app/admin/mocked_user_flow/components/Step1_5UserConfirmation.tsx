'use client'

import React from 'react'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import BookSessionButton from 'components/BookSessionButton'
import { BookedCard } from 'components/BookedCard'
import { AppointmentRequestType } from '@/lib/types'
import ClientConfirmationFeature from '@/features/ClientConfirmationFeature'
import { H2 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

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
    <Box className="mb-12 rounded-lg bg-surface-50 p-6 shadow dark:bg-surface-800">
      <H2 className="mb-4">{'Step 1.5: User Confirmation Page'}</H2>
      <TextBase status="secondary" className="mb-4">
        {'This is what the user sees immediately after submitting their booking request:'}
      </TextBase>

      {/* Simulated confirmation page content */}
      <Box className="rounded-lg border-2 border-dashed border-accent-300 bg-surface-100 p-6 dark:border-accent-600 dark:bg-surface-900">
        <ClientConfirmationFeature />
      </Box>
    </Box>
  )
}
