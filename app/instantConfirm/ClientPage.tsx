'use client'

import clsx from 'clsx'
import { useAppDispatch, useReduxAvailability, useReduxFormData } from '@/redux/hooks'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import BookSessionButton from 'components/BookSessionButton'
import { BookedCard } from 'components/BookedCard'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import pagesData from '@/data/pages.json'
import { H1 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

export default function Confirmation() {
  const { selectedTime, timeZone, duration } = useReduxAvailability()

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
  const {
    firstName,
    lastName,
    location,
    phone,
    email,
    hotelRoomNumber,
    parkingInstructions,
    additionalNotes,
  } = useReduxFormData()

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
    hotelRoomNumber,
    parkingInstructions,
    additionalNotes,
    duration,
  }

  const { instantConfirm } = pagesData

  return (
    <>
      <Box className="w-full max-w-2xl px-4 py-4 sm:px-0 sm:py-8">
        <H1 className="sm:text-5xl" status="primary">
          {instantConfirm.heading}
        </H1>
        <TextBase className="mt-6 text-xl font-medium text-accent-800 dark:text-accent-200">
          {instantConfirm.subheading}
        </TextBase>
      </Box>

      <BookedCard {...bookedData} />

      <Stack className="flex-grow pt-12" direction="row" align="center" justify="center">
        <BookSessionButton title={instantConfirm.button} href="/book" />
      </Stack>
    </>
  )
}
