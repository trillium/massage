'use client'

import React from 'react'
import { DialogTitle } from '@headlessui/react'
import { useRouter } from 'next/navigation'

import Modal from 'components/Modal'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import NameFields from './fields/NameFields'
import PhoneField from './fields/PhoneField'
import LocationField from './fields/LocationField'
import EmailField from './fields/EmailField'
import PaymentMethodField from './fields/PaymentMethodField'
import HotelField from './fields/HotelField'
import ParkingField from './fields/ParkingField'
import NotesField from './fields/NotesField'
import { handleSubmit } from './handleSubmit'

import { DEFAULT_PRICING } from 'config'
import { setModal } from '@/redux/slices/modalSlice'
import {
  useAppDispatch,
  useReduxAvailability,
  useReduxFormData,
  useReduxEventContainers,
  useReduxModal,
  useReduxConfig,
} from '@/redux/hooks'
import { ChairAppointmentBlockProps, PaymentMethodType } from 'lib/types'
import siteMetadata from 'data/siteMetadata'
import BookingSummary from './BookingSummary'
import BookingFormActions from './BookingFormActions'
import { useBookingFormChange } from './useBookingFormChange'
const { eventBaseString } = siteMetadata

// Define the props interface
type BookingFormProps = {
  additionalData?: Partial<ChairAppointmentBlockProps>
  acceptingPayment?: boolean
  endPoint: string
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function BookingForm({
  additionalData = {},
  endPoint,
  acceptingPayment = true,
  onSubmit,
}: BookingFormProps) {
  const dispatchRedux = useAppDispatch()
  const formData = useReduxFormData()
  const eventContainers = useReduxEventContainers()
  const config = useReduxConfig()
  const { status: modal } = useReduxModal()
  const { selectedTime, timeZone, duration } = useReduxAvailability()
  const price = duration ? DEFAULT_PRICING[duration] : 'null'
  const router = useRouter()
  const formOnChange = useBookingFormChange()

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formOnChange({
      target: {
        name: e.target.name,
        value: e.target.value,
      },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    formOnChange({
      target: {
        name: e.target.name,
        value: e.target.value,
      },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  const dateString =
    selectedTime && timeZone ? formatLocalDate(selectedTime.start, { timeZone }) : ''
  const startString =
    selectedTime && timeZone ? formatLocalTime(selectedTime.start, { timeZone }) : ''
  const endString =
    selectedTime && timeZone
      ? formatLocalTime(selectedTime.end, {
          timeZone,
          timeZoneName: 'shortGeneric',
        })
      : ''

  return (
    <Modal
      open={modal !== 'closed'}
      setOpen={(open) => {
        dispatchRedux(setModal({ status: open ? 'open' : 'closed' }))
      }}
    >
      {!selectedTime || !timeZone ? (
        <div className="flex min-h-[200px] items-center justify-center">Loading...</div>
      ) : (
        <form
          className="mt-3 sm:mt-0 sm:ml-4"
          onSubmit={(event) => {
            if (onSubmit) {
              onSubmit(event)
            } else {
              handleSubmit({
                event,
                dispatchRedux,
                router,
                additionalData,
                endPoint,
              })
            }
          }}
        >
          <DialogTitle
            as="h3"
            className="text-base leading-6 font-semibold text-gray-900 dark:text-gray-100"
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

          <BookingSummary
            dateString={dateString}
            startString={startString}
            endString={endString}
            price={price}
            acceptingPayment={acceptingPayment}
          />
          <div className="flex flex-col space-y-4">
            <div className="isolate -space-y-px rounded-md shadow-sm">
              <NameFields
                firstName={formData.firstName || ''}
                lastName={formData.lastName || ''}
                onChange={formOnChange}
              />
              <PhoneField phone={formData.phone || ''} onChange={formOnChange} />
              <LocationField
                location={
                  (eventContainers && eventContainers.location) ||
                  (config && config.location) ||
                  (formData && formData.location) || { street: '', city: '', zip: '' }
                }
                readOnly={
                  !!(eventContainers && eventContainers.location) || config.locationIsReadOnly
                }
                onChange={formOnChange}
              />
              <EmailField email={formData.email || ''} onChange={formOnChange} />
              {(additionalData?.showHotelField || config?.customFields?.showHotelField) && (
                <HotelField
                  hotelRoomNumber={
                    typeof formData.hotelRoomNumber === 'string' ? formData.hotelRoomNumber : ''
                  }
                  onChange={formOnChange}
                />
              )}
              {(additionalData?.showParkingField || config?.customFields?.showParkingField) && (
                <ParkingField
                  parkingInstructions={
                    typeof formData.parkingInstructions === 'string'
                      ? formData.parkingInstructions
                      : ''
                  }
                  onChange={handleSelectChange}
                />
              )}
              {(additionalData?.showNotesField || config?.customFields?.showNotesField) && (
                <NotesField
                  additionalNotes={
                    typeof formData.additionalNotes === 'string' ? formData.additionalNotes : ''
                  }
                  onChange={handleTextAreaChange}
                />
              )}
            </div>
            {acceptingPayment && (
              <PaymentMethodField selected={formData.paymentMethod} onChange={formOnChange} />
            )}
          </div>
          {modal === 'error' && (
            <div className="bg-red-50 text-red-600">
              There was an error submitting your request.
            </div>
          )}
          <BookingFormActions />
        </form>
      )}
    </Modal>
  )
}
