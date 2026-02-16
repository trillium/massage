'use client'

import clsx from 'clsx'
import { redirect } from 'next/navigation'
import {
  useAppDispatch,
  useReduxAvailability,
  useReduxConfig,
  useReduxFormData,
} from '@/redux/hooks'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import BookSessionButton from 'components/BookSessionButton'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { BookedCard } from 'components/BookedCard'
import { DEFAULT_PRICING } from 'config'

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
  // Get form data from Redux
  const { firstName, lastName, locationString, phone, email, promo, bookingUrl } =
    useReduxFormData()
  const { pricing: pricingRedux } = useReduxConfig()
  const { duration } = useReduxAvailability()

  const pricing = pricingRedux || DEFAULT_PRICING
  const price = duration ? pricing[duration] : 'null'

  const BookedData = {
    dateString: dateString!,
    startString: startString!,
    endString: endString!,
    state: 'Pending' as const,
    firstName: firstName!,
    lastName: lastName!,
    location: locationString || '',
    phone: phone!,
    email: email!,
    price: price,
    promo: promo || undefined,
    bookingUrl: bookingUrl || undefined,
    duration,
  }

  // If BookedData is missing required fields, redirect to home
  if (
    !BookedData.dateString ||
    !BookedData.startString ||
    !BookedData.endString ||
    !BookedData.firstName ||
    !BookedData.lastName ||
    !BookedData.phone ||
    !BookedData.email
  ) {
    redirect('/')
  }

  return (
    <>
      <div className="w-full max-w-2xl px-4 py-4 sm:px-0 sm:py-8">
        <h1 className="text-primary-500 dark:text-primary-400 text-3xl font-bold tracking-tight sm:text-5xl">
          Thanks!
        </h1>
        <p className="mt-6 text-xl font-medium text-gray-800 dark:text-gray-200">
          Your request has been received!
        </p>
        <p className="mt-6 text-xl font-medium text-gray-800 dark:text-gray-200">
          I&apos;ll review the appointment and get back to you shortly!
        </p>
      </div>
      <BookedCard {...BookedData} />

      <div className="flex flex-grow items-center justify-center pt-12">
        <BookSessionButton title="Book Another Session!" href="/book" />
      </div>
    </>
  )
}
