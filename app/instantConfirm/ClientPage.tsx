'use client'

import clsx from 'clsx'
import { useAppDispatch, useReduxAvailability, useReduxFormData } from '@/redux/hooks'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import BookSessionButton from 'components/BookSessionButton'
import { BookedCard } from 'components/BookedCard'
import { flattenLocation } from '@/lib/helpers/locationHelpers'

export default function Confirmation() {
  const { selectedTime, timeZone } = useReduxAvailability()

  let dateString = ''
  let startString = ''
  let endString = ''

  if (selectedTime) {
    dateString = formatLocalDate(selectedTime.start, { timeZone })
    startString = formatLocalTime(selectedTime.start, { timeZone })
    endString = formatLocalTime(selectedTime.end, {
      timeZone,
      timeZoneName: 'shortGeneric',
    })
  }
  const { firstName, lastName, location, phone, email } = useReduxFormData()

  const bookedData = {
    dateString: dateString!,
    startString: startString!,
    endString: endString!,
    state: 'Confirmed' as const,
    firstName: firstName!,
    lastName: lastName!,
    location: flattenLocation(location),
    phone: phone!,
    email: email!,
  }

  return (
    <>
      <div className="w-full max-w-2xl px-4 py-4 sm:px-0 sm:py-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-500 dark:text-primary-400 sm:text-5xl">
          Thanks!
        </h1>
        <p className="mt-6 text-xl font-medium text-gray-800 dark:text-gray-200">
          Your appoint has been booked!
        </p>
      </div>
      <BookedCard {...bookedData} />

      <div className="flex flex-grow items-center justify-center pt-12">
        <BookSessionButton title="Book Another Session!" href="/" />
      </div>
    </>
  )
}
