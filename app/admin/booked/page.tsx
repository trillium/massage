/* ds-ignore-file */
import React from 'react'

import SectionContainer from '@/components/SectionContainer'
import { BookedDataSchema } from '@/lib/schema'
import { BookedCard } from 'components/BookedCard'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import { AttendeeType } from 'lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import Link from '@/components/Link'
import { H1 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ url: string; data: string; email?: string; token?: string }>
}) {
  const params = await searchParams
  const { url, data: dataRaw, email, token } = params

  const parsedData = JSON.parse(dataRaw)

  // Validate the booked data structure
  const validationResult = BookedDataSchema.safeParse(parsedData)

  if (!validationResult.success) {
    console.error('Invalid booked data structure:', validationResult.error)
    // Return error page or fallback
    return (
      <SectionContainer>
        <Box className="mx-auto max-w-xl py-8 sm:py-16">
          <H1 status="error">{'Error'}</H1>
          <TextBase status="secondary" className="mt-4">
            {'Invalid appointment data. Please try again.'}
          </TextBase>
        </Box>
      </SectionContainer>
    )
  }

  const data = validationResult.data

  const attendees = Array.isArray(data.attendees)
    ? data.attendees.map((p: AttendeeType) => p.email).join(', ')
    : ''

  const h1Message =
    url && typeof url === 'string'
      ? 'The appointment has been confirmed.'
      : 'There was an error with the url parameter.'

  let dateString = ''
  let startString = ''
  let endString = ''

  const { start, end } = data
  const { timeZone } = start

  try {
    dateString = formatLocalDate(start.dateTime, { timeZone }) || 'error dateString'
    startString =
      formatLocalTime(start.dateTime, {
        timeZone,
        timeZoneName: 'shortGeneric',
      }) || 'error startString'
    endString =
      formatLocalTime(end.dateTime, {
        timeZone,
        timeZoneName: 'shortGeneric',
      }) || 'error endString'
  } catch {
    dateString = 'error dateString'
    startString = 'error startString'
    endString = 'error endString'
  }

  return (
    <SectionContainer>
      <Box className="mx-auto max-w-xl py-8 sm:py-16">
        <H1 status="primary">{h1Message}</H1>
        <TextBase className="mt-6 text-xl font-medium text-accent-800 dark:text-accent-200">
          {"It's now on your calendar and an invite has been sent to the client's email at:"}{' '}
          {attendees || 'them'}
          {'.'}
        </TextBase>
        <TextBase className="mt-6 text-xl font-medium text-accent-800 dark:text-accent-200">
          <Link
            href={'https://www.google.com/calendar/event?eid=' + url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline"
          >
            {'View it on Google Calendar'}
          </Link>
        </TextBase>
      </Box>

      <BookedCard
        {...data}
        dateString={dateString}
        startString={startString}
        endString={endString}
        location={
          data.locationString || (data.locationObject ? flattenLocation(data.locationObject) : '')
        }
      />
    </SectionContainer>
  )
}
