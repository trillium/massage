'use client'

import React from 'react'
import { BookedCard } from 'components/BookedCard'
import BookSessionButton from 'components/BookSessionButton'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'

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
  if (!data) {
    return <div className="text-center text-gray-500">No booking data available</div>
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
  }

  return (
    <div className="rounded-lg bg-gray-50 p-6 dark:bg-slate-900">
      <div className="w-full max-w-2xl px-4 py-4 sm:px-0 sm:py-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-500 dark:text-primary-400 sm:text-5xl">
          Thanks!
        </h1>
        <p className="mt-6 text-xl font-medium text-gray-800 dark:text-gray-200">
          Your appointment has been booked!
        </p>
      </div>

      <BookedCard {...bookedData} />

      <div className="flex flex-grow items-center justify-center pt-12">
        <BookSessionButton title="Book Another Session!" href="/" />
      </div>
    </div>
  )
}
