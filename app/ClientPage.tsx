'use client'

import type { InferGetServerSidePropsType } from 'next'

import AvailabilityPicker from 'components/availability/AvailabilityPicker'
import { PricingWrapper } from 'components/availability/PricingWrapper'
import { DEFAULT_PRICING } from 'config'

import PageProps from './page'
import BookingForm from 'components/booking/BookingForm'

const pricing = DEFAULT_PRICING

// Need to refactor fetchData so it's easier to extend to other pages

function Page({
  start,
  end,
  busy,
  selectedDate,
  duration,
}: InferGetServerSidePropsType<typeof PageProps>) {
  const { slots, pickerProps } = PricingWrapper({
    start,
    end,
    busy,
    pricing,
    selectedDate,
    duration,
  })

  return (
    <>
      <AvailabilityPicker slots={slots} pickerProps={pickerProps}>
        <BookingForm endPoint="api/request" />
      </AvailabilityPicker>
    </>
  )
}

export default Page
