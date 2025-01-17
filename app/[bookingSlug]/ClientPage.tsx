'use client'

import type { InferGetServerSidePropsType } from 'next'

import Template from '@/components/Template'
import AvailabilityPicker from '@/components/availability/AvailabilityPicker'
import { PricingWrapper } from '@/components/availability/PricingWrapper'
import { DEFAULT_PRICING } from 'config'
import { DateTimeIntervalAndLocation } from '@/lib/types'

import PageProps from './page'
import { mapStringsToDates } from '@/lib/availability/helpers'
import BookingForm from '@/components/booking/BookingForm'

const pricing = DEFAULT_PRICING

// Need to refactor fetchData so it's easier to extend to other pages

function Page({
  start,
  end,
  busy,
  selectedDate,
  duration,
  containers,
  eventMemberString,
  ...props
}: InferGetServerSidePropsType<typeof PageProps>) {
  const containerDateTimeInterval: DateTimeIntervalAndLocation[] = mapStringsToDates(containers)

  const topContainerRaw = containers.length > 0 && containers[0] ? containers[0] : {}
  const { start: dropStart, end: dropEnd, ...rest } = topContainerRaw
  const topContainer = { ...rest }

  const { slots, pickerProps } = PricingWrapper({
    start,
    end,
    busy,
    pricing,
    selectedDate,
    duration,
    containers: containerDateTimeInterval,
    eventMemberString,
    ...topContainer,
  })

  const { acceptingPayment: payment } = props
  const acceptingPayment = !!payment

  return (
    <main className="mx-4 max-w-2xl pb-24 sm:mx-auto">
      <Template title={topContainer.description ?? 'Book a session with Trillium :)'} />
      <AvailabilityPicker slots={slots} pickerProps={pickerProps}>
        <BookingForm endPoint="api/request" acceptingPayment={acceptingPayment} />
      </AvailabilityPicker>
    </main>
  )
}

export default Page
