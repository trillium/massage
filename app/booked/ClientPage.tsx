'use client'

import { BookedCard } from 'components/BookedCard'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import { AttendeeType } from 'lib/types'
import clsx from 'clsx'

export default function Booked({ url, data }: { url: string; data: any }) {
  console.log(url, data)
  const attendees = Array.isArray(data.attendees)
    ? data.attendees.map((p: AttendeeType) => p.email).join(', ')
    : ''

  const h1Message =
    !url || typeof url !== 'string'
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
    <>
      <div className="mx-auto max-w-xl py-8 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600 dark:text-primary-500">
          {h1Message}
        </h1>
        <p className="mt-6 text-xl font-medium text-gray-800 dark:text-gray-200">
          It’s now on your calendar and an invite has been sent to the client&apos; email at:{' '}
          {attendees || 'them'}.
        </p>
        <p className="mt-6 text-xl font-medium text-gray-800 dark:text-gray-200">
          <a
            href={'https://www.google.com/calendar/event?eid=' + url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline"
          >
            View it on Google Calendar
          </a>
        </p>
      </div>

      <BookedCard
        {...data}
        dateString={dateString}
        startString={startString}
        endString={endString}
      />
    </>
  )
}
