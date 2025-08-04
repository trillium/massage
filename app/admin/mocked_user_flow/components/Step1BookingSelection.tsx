'use client'

import React from 'react'
import BookingForm from 'components/booking/BookingForm'
import TimeButton from 'components/availability/time/TimeButton'
import DurationPicker from 'components/availability/controls/DurationPicker'
import Calendar from 'components/availability/date/Calendar'
import { DEFAULT_PRICING, ALLOWED_DURATIONS } from 'config'
import { durationProps } from '@/lib/slugConfigurations/helpers/buildDurationProps'

interface Step1BookingSelectionProps {
  selectedDuration: number
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  durationProps: durationProps
}

export default function Step1BookingSelection({
  selectedDuration,
  onSubmit,
  durationProps,
}: Step1BookingSelectionProps) {
  return (
    <div className="mb-12 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
        Step 1: Booking Form
      </h2>
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Fill out the form below to simulate a booking request:
        </p>

        {/* Duration Picker */}
        <div className="rounded bg-purple-50 p-4 dark:bg-purple-900/20">
          <DurationPicker {...durationProps} />
        </div>

        {/* Calendar Selection */}
        <div className="mt-4 rounded bg-green-50 p-4 dark:bg-green-900/20">
          <h3 className="mb-2 text-sm font-medium text-green-800 dark:text-green-200">
            Calendar Selection
          </h3>
          <div className="w-full">
            <Calendar
              slots={[
                {
                  start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
                  location: 'Mock Location',
                },
                {
                  start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                  end: new Date(
                    Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000
                  ).toISOString(),
                  location: 'Mock Location',
                },
                {
                  start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                  end: new Date(
                    Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000
                  ).toISOString(),
                  location: 'Mock Location',
                },
              ]}
              start={new Date().toISOString()}
              end={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}
              timeZone="America/Los_Angeles"
            />
          </div>
        </div>

        {/* Mock Time Selection */}
        <div className="rounded bg-blue-50 p-4 dark:bg-blue-900/20">
          <h3 className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-200">
            Quick Time Selection
          </h3>
          <div className="flex flex-wrap gap-2">
            <TimeButton
              time={{
                start: (() => {
                  const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
                  date.setHours(10, 0, 0, 0)
                  return date.toISOString()
                })(),
                end: (() => {
                  const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
                  date.setHours(11, 30, 0, 0)
                  return date.toISOString()
                })(),
              }}
              active={false}
            />
            <TimeButton
              time={{
                start: (() => {
                  const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
                  date.setHours(14, 0, 0, 0)
                  return date.toISOString()
                })(),
                end: (() => {
                  const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
                  date.setHours(15, 30, 0, 0)
                  return date.toISOString()
                })(),
              }}
              active={false}
            />
            <TimeButton
              time={{
                start: (() => {
                  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  date.setHours(16, 0, 0, 0)
                  return date.toISOString()
                })(),
                end: (() => {
                  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  date.setHours(17, 30, 0, 0)
                  return date.toISOString()
                })(),
              }}
              active={false}
            />
          </div>
        </div>

        {/* Booking Form Modal */}
        <BookingForm
          endPoint="/admin/mocked_user_flow/mock-submit"
          onSubmit={onSubmit}
          acceptingPayment={true}
        />
      </div>
    </div>
  )
}
