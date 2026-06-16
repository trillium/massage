'use client'

import React from 'react'
import { BookedCard } from 'components/BookedCard'
import BookSessionButton from 'components/BookSessionButton'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import { useReduxAvailability } from '@/redux/hooks'
import { H1 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface MockedConfirmationPageProps {
  data: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    location?: string
    start: string
    end: string
    timeZone?: string
    price?: string
  } | null
}

export default function MockedConfirmationPage({ data }: MockedConfirmationPageProps) {
  const { duration } = useReduxAvailability()

  if (!data) {
    return <Box className="text-center text-accent-500">No booking data available</Box>
  }

  const start = new Date(data.start)
  const end = new Date(data.end)
  const timeZone = data.timeZone || 'America/Los_Angeles'

  const dateString = formatLocalDate(start, { timeZone })
  const startString = formatLocalTime(start, { timeZone })
  const endString = formatLocalTime(end, {
    timeZone,
    timeZoneName: 'shortGeneric',
  })

  const bookedData = {
    dateString,
    startString,
    endString,
    state: 'Confirmed' as const,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    location: data.location || '',
    phone: data.phone || '',
    email: data.email || '',
    price: data.price || '',
    duration,
  }

  return (
    <Box className="rounded-lg bg-surface-100 p-6 dark:bg-surface-900">
      <Box className="w-full max-w-2xl px-4 py-4 sm:px-0 sm:py-8">
        <H1 className="sm:text-5xl" status="primary">
          Thanks!
        </H1>
        <TextBase className="mt-6 text-xl font-medium text-accent-800 dark:text-accent-200">
          Your appointment has been booked!
        </TextBase>
      </Box>

      <BookedCard {...bookedData} />

      <Stack className="flex-grow pt-12" direction="row" align="center" justify="center">
        <BookSessionButton title="Book Another Session!" href="/book" />
      </Stack>
    </Box>
  )
}
