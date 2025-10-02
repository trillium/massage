'use client'

import clsx from 'clsx'
import 'wicg-inert'

import { ALLOWED_DURATIONS, DEFAULT_PRICING } from 'config'

import type { PageProps } from 'app/book/page'
import { AllowedDurationsType } from '@/lib/types'
import { useEffect, useRef, useState } from 'react'
import { useFormik } from 'formik'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import BookingForm from '@/components/booking/BookingForm'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import DurationPicker from '@/components/availability/controls/DurationPicker'

// Need to refactor fetchData so it's easier to extend to other pages
const possibleDurations = [15, 30, 45, 60]

const paymentOptionsList = [
  'Massage session block prepaid in full',
  'Split individual booking fees with client',
  'Individuals pay for their own sessions',
] // These need more explanation

const OnsiteSchema = z.object({
  eventName: z.string().max(60, 'Too Long!').min(1, 'Required'),
  allowedDurations: z
    .array(z.number())
    .min(1, 'At least one duration must be selected.')
    .default([]),
  paymentOptions: z.string().min(1, 'Required'),
})

function ClientPage({ duration, children }: { duration: number; children?: React.ReactNode }) {
  const pricing = DEFAULT_PRICING

  const formik = useFormik({
    initialValues: {
      eventName: '',
      eventBaseString: '__EVENT__',
      eventContainerString: '__EVENT__CONTAINER__',
      allowedDurations: [] as number[],
      pricing: {
        15: (120 * 1) / 4,
        30: (120 * 2) / 4,
        45: (120 * 3) / 4,
        60: (120 * 4) / 4,
      },
      paymentOptions: '',
      leadTime: 0,
    },
    validationSchema: toFormikValidationSchema(OnsiteSchema),
    onSubmit: (values) => {},
  })

  const [pathString, setPathString] = useState('')

  const formCheckboxOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10)
    // Ensure allowedDurations is always an array
    const allowedDurations: number[] = Array.isArray(formik.values.allowedDurations)
      ? formik.values.allowedDurations
      : []

    const newDurations = allowedDurations.includes(value)
      ? allowedDurations.filter((duration) => duration !== value)
      : [...allowedDurations, value]

    setFieldValue('allowedDurations', newDurations)
  }

  const { eventName } = formik.values
  const { setFieldValue } = formik

  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (divRef.current) {
      if (!formik.isValid) {
        divRef.current.setAttribute('inert', 'true')
      } else {
        divRef.current.removeAttribute('inert')
      }
    }
  }, [formik.isValid])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sanitizedName =
        eventName
          .replace(/\s|-/g, '_')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '') || 'your_name_here'
      const newPathString = window.location.origin + '/' + sanitizedName
      setPathString(newPathString)
      setFieldValue('eventBaseString', sanitizedName + '__EVENT__')
      setFieldValue('eventContainerString', sanitizedName + '__EVENT__CONTAINER__')
    }
  }, [eventName, setFieldValue])

  const durationString = `${duration || '##'} minute session`
  const paymentString = ' - $' + pricing[duration]
  const combinedString = durationString + paymentString

  const durationProps = {
    title: combinedString,
    price: pricing,
    duration: duration,
    allowedDurations: ALLOWED_DURATIONS,
  }

  return (
    <>
      <div className="flex w-full items-center justify-center align-middle">
        <h2 className="text-primary-500 dark:text-primary-400 py-2 text-lg font-bold">
          Your link: {pathString}
        </h2>
      </div>
      <form onBlur={formik.handleBlur}>
        <ol>
          <label
            htmlFor="eventName"
            className="block text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Let&rsquo;s pick a name for your booking:
          </label>
          <input
            aria-label="Event Name"
            type="text"
            name="eventName"
            id="eventName"
            value={formik.values.eventName}
            onChange={formik.handleChange}
            className="focus:border-primary-500 focus:ring-primary-500 mb-1 block w-full rounded-md border-2 border-slate-100 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-2 sm:text-base sm:leading-6 dark:border-white dark:text-gray-100"
            placeholder="e.g., WeWork Playa Vista"
            maxLength={60}
            required
            aria-required
          />
          <div className="min-h-[1.25rem] text-sm text-red-600">
            {(formik.touched.eventName && formik.errors.eventName) || ' '}
          </div>

          <label
            htmlFor="sessionDuration"
            className="block pt-4 text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            How long should sessions be?
          </label>
          <div className="flex flex-col space-y-2 pl-4">
            <fieldset onBlur={formik.handleBlur('allowedDurations')}>
              {possibleDurations.map((duration) => (
                <div className="flex items-center" key={duration}>
                  <input
                    checked={formik.values.allowedDurations.includes(duration)}
                    id={`checked-checkbox-${duration}`}
                    type="checkbox"
                    value={duration}
                    className="focus:ring-primary-500 dark:focus:ring-primary-400 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                    onChange={formCheckboxOnChange}
                    required
                    aria-required
                  />
                  <label htmlFor={`checked-checkbox-${duration}`} className="ms-2 font-medium">
                    {duration} minutes
                  </label>
                </div>
              ))}
            </fieldset>
            <div className="min-h-[1.25rem] text-sm text-red-600">
              {(formik.touched.allowedDurations && formik.errors.allowedDurations) || ' '}
            </div>
          </div>

          <label
            htmlFor="sessionDuration"
            className="block pt-4 text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Payment options
          </label>
          <div className="flex flex-col space-y-2 pl-4">
            {paymentOptionsList.map((option) => (
              <div className="flex items-center" key={option}>
                <input
                  id={`checked-checkbox-${option}`}
                  type="radio"
                  name="paymentOptions"
                  value={option}
                  className="focus:ring-primary-500 dark:focus:ring-primary-400 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                  onChange={formik.handleChange}
                  required
                />
                <label htmlFor={`checked-checkbox-${option}`} className="ms-2 font-medium">
                  {option}
                </label>
              </div>
            ))}
            <div className="min-h-[1.25rem] text-sm text-red-600">
              {(formik.touched.paymentOptions && formik.errors.paymentOptions) || ' '}
            </div>
          </div>
        </ol>
      </form>
      {children}
      <BookingForm additionalData={formik.values} />
    </>
  )
}

export default ClientPage
