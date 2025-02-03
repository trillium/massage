'use client'

import React from 'react'
import { DialogTitle } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'

import Modal from 'components/Modal'
import Spinner from 'components/Spinner'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'

import { setForm } from '@/redux/slices/formSlice'
import type { AppDispatch } from '@/redux/store'
import { DEFAULT_DURATION, DEFAULT_PRICING } from 'config'
import { setModal } from '@/redux/slices/modalSlice'
import {
  useAppDispatch,
  useReduxAvailability,
  useReduxFormData,
  useReduxEventContainers,
  useReduxModal,
  useReduxConfig,
} from '@/redux/hooks'
import { ChairAppointmentBlockProps } from 'lib/types'
import { paymentMethod } from 'data/paymentMethods'
import siteMetadata from 'data/siteMetadata'
import clsx from 'clsx'
import { GeneratePrice } from '@/components/utilities/GeneratePriceAtom'
const { eventBaseString } = siteMetadata

// Define the props interface
type BookingFormProps = {
  additionalData?: Partial<ChairAppointmentBlockProps>
  acceptingPayment?: boolean
  endPoint: string
}

export default function BookingForm({ additionalData = {}, endPoint }: BookingFormProps) {
  const dispatchRedux = useAppDispatch()
  const formData = useReduxFormData()
  const configData = useReduxConfig()
  const eventContainers = useReduxEventContainers()
  const { status: modal } = useReduxModal()
  const { selectedTime, timeZone, duration: durationRedux } = useReduxAvailability()
  const duration = durationRedux ?? DEFAULT_DURATION
  const price = DEFAULT_PRICING[duration]

  const { acceptingPayment = true } = configData ?? {}

  const router = useRouter()

  if (!selectedTime || !timeZone) {
    return <></>
  }

  const dateString = formatLocalDate(selectedTime.start, { timeZone })
  const startString = formatLocalTime(selectedTime.start, { timeZone })
  const endString = formatLocalTime(selectedTime.end, {
    timeZone,
    timeZoneName: 'shortGeneric',
  })

  const formOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    dispatchRedux(setForm({ ...formData, [target.name]: target.value }))
  }

  return (
    <Modal
      open={modal !== 'closed'}
      setOpen={(open) => {
        dispatchRedux(setModal({ status: open ? 'open' : 'closed' }))
      }}
    >
      <form
        className="mt-3 sm:ml-4 sm:mt-0"
        onSubmit={(event) => {
          handleSubmit({
            event,
            dispatchRedux,
            router,
            additionalData,
            endPoint,
          })
        }}
      >
        <DialogTitle
          as="h3"
          className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100"
        >
          Request appointment
        </DialogTitle>

        <input type="hidden" readOnly name="start" value={selectedTime.start} />
        <input type="hidden" readOnly name="end" value={selectedTime.end} />
        <input type="hidden" readOnly name="duration" value={duration || 0} />
        {acceptingPayment && <input type="hidden" readOnly name="price" value={price} />}
        <input type="hidden" readOnly name="timeZone" value={timeZone} />
        <input type="hidden" readOnly name="eventBaseString" value={eventBaseString} />
        {eventContainers && eventContainers.eventBaseString && (
          <input
            type="hidden"
            readOnly
            name="eventBaseString"
            value={eventContainers.eventBaseString}
          />
        )}
        {eventContainers && eventContainers.eventMemberString && (
          <input
            type="hidden"
            readOnly
            name="eventMemberString"
            value={eventContainers.eventMemberString}
          />
        )}

        <div className="mb-4 mt-3 rounded-md border-l-4 border-l-primary-400 bg-primary-50/30 p-3 dark:bg-primary-50/10">
          <p className="text-sm font-semibold text-primary-800 dark:text-primary-400 md:text-base">
            {dateString}
          </p>
          <p className="text-xs md:text-sm">
            {startString} - {endString}
          </p>
          {acceptingPayment && (
            <p className="text-xs md:text-sm">
              <GeneratePrice price={price} discount={configData.discount} />
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          <div className="isolate -space-y-px rounded-md shadow-sm">
            <div className="row relative flex px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2 focus-within:ring-primary-400">
              <div className="mx-1 w-full">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  First Name
                </label>
                <input
                  aria-label="Name"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="given-name"
                  required
                  aria-required
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  placeholder="First"
                  onChange={formOnChange}
                  className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-base sm:leading-6"
                />
              </div>
              <div className="mx-1 w-full">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Last Name
                </label>
                <input
                  aria-label="Name"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="family-name"
                  required
                  aria-required
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  placeholder="Last"
                  onChange={formOnChange}
                  className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-base sm:leading-6"
                />
              </div>
            </div>
            <div className="relative px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2 focus-within:ring-primary-400">
              <label
                htmlFor="phone"
                className="block text-xs font-medium text-gray-900 dark:text-gray-100"
              >
                Phone Number
              </label>
              <input
                aria-label="Phone Number"
                required
                autoComplete="tel"
                aria-required
                name="phone"
                id="phone"
                value={formData && formData.phone}
                className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-sm sm:leading-6"
                placeholder="(555) 444 - 3333"
                onChange={formOnChange}
              />
            </div>
            <div className="relative px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2 focus-within:ring-primary-400">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-900 dark:text-gray-100"
              >
                Location
              </label>
              <input
                aria-label="street address"
                required
                autoComplete="street-address"
                aria-required
                name="location"
                id="location"
                value={eventContainers?.location ?? configData?.location ?? formData?.location}
                readOnly={configData.locationIsReadOnly ?? false}
                className={clsx(
                  'mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-sm sm:leading-6',
                  {
                    'select-none bg-gray-400 dark:bg-gray-700':
                      !!configData.locationIsReadOnly || !!eventContainers?.location || false,
                  }
                )}
                placeholder="123 Address Road, Beverly Hills, CA 90210"
                onChange={formOnChange}
              />
            </div>
            <div className="relative px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2 focus-within:ring-primary-400">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-900 dark:text-gray-100"
              >
                Email Address
              </label>
              <input
                aria-label="Email"
                required
                autoComplete="email"
                aria-required
                type="email"
                name="email"
                id="email"
                value={formData && formData.email}
                className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-sm sm:leading-6"
                placeholder="name@example.com"
                onChange={formOnChange}
              />
            </div>
          </div>
          {acceptingPayment && (
            <div>
              <p className="text-sm font-medium">Intended payment method</p>
              <fieldset className="mt-2">
                <div className="space-y-4 sm:flex sm:items-center sm:space-x-4 sm:space-y-0">
                  {paymentMethod.map((payType) => (
                    <div key={payType.value} className="flex items-center">
                      <input
                        id={payType.value}
                        aria-label={payType.name}
                        name="paymentMethod"
                        type="radio"
                        value={payType.value}
                        defaultChecked={payType.value === paymentMethod[0].value}
                        className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-400"
                        onChange={formOnChange}
                      />
                      <label
                        htmlFor={payType.value}
                        className="ml-1.5 block text-sm leading-6 text-gray-800 dark:text-gray-100"
                      >
                        {payType.name}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="pl-4 text-sm text-gray-500 dark:text-gray-300">
                  *{' '}
                  {!!formData &&
                    paymentMethod.filter((p) => p.value === formData.paymentMethod)[0].hint}
                </p>
              </fieldset>
            </div>
          )}
        </div>
        {modal === 'error' && (
          <div className="bg-red-50 text-red-600">There was an error submitting your request.</div>
        )}
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            disabled={modal === 'busy'}
            className="inline-flex w-full justify-center rounded-md bg-primary-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
          >
            {modal === 'busy' ? (
              <>
                Submitting ... <Spinner className="ml-2" />
              </>
            ) : (
              <>Submit</>
            )}
          </button>
          <button
            type="button"
            className="hocus:bg-gray-100 mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
            onClick={() => {
              dispatchRedux(setModal({ status: 'closed' }))
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

/**
 *
 * Handles form submissions by intercepting the native event,
 * passing params to the `/book` endpoint, and redirecting
 * upon success (or showing a failure message).
 *
 */
export function handleSubmit({
  event,
  dispatchRedux,
  router,
  additionalData,
  endPoint,
}: {
  event: FormEvent<HTMLFormElement>
  dispatchRedux: AppDispatch
  router: ReturnType<typeof useRouter>
  additionalData: Partial<ChairAppointmentBlockProps>
  endPoint: string
}) {
  event.preventDefault()
  dispatchRedux(setModal({ status: 'busy' }))
  fetch(endPoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...Object.fromEntries(new FormData(event.currentTarget)),
      ...additionalData,
    }),
  })
    .then(async (data) => {
      const json = await data.json()
      if (json.success) {
        dispatchRedux(setModal({ status: 'closed' }))
        router.push('/confirmation')
      } else {
        dispatchRedux(setModal({ status: 'error' }))
      }
    })
    .catch(() => {
      dispatchRedux(setModal({ status: 'error' }))
    })
}
