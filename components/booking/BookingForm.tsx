'use client'

import { DialogTitle } from '@headlessui/react'
import { Formik, Form, FormikHelpers } from 'formik'

import Modal from 'components/Modal'
import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'

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
import { ChairAppointmentBlockProps } from 'lib/types'
import BookingSummary from './BookingSummary'
import BookingFormActions from './BookingFormActions'
import BookingFormFields from './BookingFormFields'
import { BookingFormValues } from '@/lib/bookingFormSchema'
import { useLocationSync } from './useLocationSync'
import { useBookingValidation } from './useBookingValidation'
import { useBookingInitialValues } from './useBookingInitialValues'
import { useBookingSubmit } from './useBookingSubmit'

type BookingFormProps = {
  additionalData?: Partial<ChairAppointmentBlockProps>
  acceptingPayment?: boolean
  endPoint?: string
  onSubmit?: (values: BookingFormValues, formikHelpers: FormikHelpers<BookingFormValues>) => void
}

export default function BookingForm({
  additionalData = {},
  endPoint = 'api/request',
  acceptingPayment = true,
  onSubmit,
}: BookingFormProps) {
  const dispatch = useAppDispatch()
  const formData = useReduxFormData()
  const eventContainers = useReduxEventContainers()
  const config = useReduxConfig()
  const { status: modal, errorMessage, errorType, eventPageUrl } = useReduxModal()
  const { selectedTime, timeZone, duration } = useReduxAvailability()
  const price =
    duration && config.pricing ? config.pricing[duration] : DEFAULT_PRICING[duration] || 'null'

  const { processPendingUpdates } = useLocationSync(config, eventContainers)
  const { validateForm, getLocationWarning } = useBookingValidation(config)
  const initialValues = useBookingInitialValues({
    formData,
    eventContainers,
    config,
    selectedTime,
    timeZone,
    duration,
    acceptingPayment,
    price,
  })
  const handleFormSubmit = useBookingSubmit({ additionalData, endPoint, onSubmit })

  const showHotelField = !!(additionalData?.showHotelField || config?.customFields?.showHotelField)
  const showParkingField = !!(
    additionalData?.showParkingField || config?.customFields?.showParkingField
  )
  const showNotesField = !!(additionalData?.showNotesField || config?.customFields?.showNotesField)
  const locationReadOnly =
    !!(eventContainers && eventContainers.location) || config.locationIsReadOnly

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
        dispatch(setModal({ status: open ? 'open' : 'closed' }))
      }}
    >
      {!selectedTime || !timeZone ? (
        <div className="flex min-h-[200px] items-center justify-center">Loading...</div>
      ) : (
        <Formik
          initialValues={initialValues}
          validate={validateForm}
          onSubmit={handleFormSubmit}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {({ values, errors, touched, setFieldValue, setFieldTouched, handleSubmit }) => {
            processPendingUpdates(setFieldValue)

            const locationWarning =
              touched.location?.city || touched.location?.zip
                ? getLocationWarning(values.location)
                : undefined

            return (
              <Form
                className="mt-3 sm:mt-0 sm:ml-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit()
                }}
              >
                <DialogTitle
                  as="h3"
                  className="text-base leading-6 font-semibold text-gray-900 dark:text-gray-100"
                >
                  Request appointment
                </DialogTitle>

                <BookingSummary
                  dateString={dateString}
                  startString={startString}
                  endString={endString}
                  price={price}
                  acceptingPayment={acceptingPayment}
                  discount={config.discount}
                  formData={values}
                />

                <BookingFormFields
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  setFieldTouched={setFieldTouched}
                  locationReadOnly={locationReadOnly}
                  locationWarning={locationWarning}
                  acceptingPayment={acceptingPayment}
                  showHotelField={showHotelField}
                  showParkingField={showParkingField}
                  showNotesField={showNotesField}
                />

                {modal === 'error' && errorType === 'partial_success' && (
                  <div className="mt-4 rounded-md bg-amber-50 p-3 text-amber-800">
                    <p className="font-medium">Your appointment was received.</p>
                    <p className="mt-1 text-sm">
                      We hit a snag sending your confirmation email, but your booking is safe. No
                      need to resubmit.
                    </p>
                    {eventPageUrl && (
                      <a
                        href={eventPageUrl}
                        className="mt-2 inline-block text-sm font-medium text-amber-700 underline"
                      >
                        View your appointment
                      </a>
                    )}
                  </div>
                )}

                {modal === 'error' && errorType !== 'partial_success' && (
                  <div className="mt-4 rounded-md bg-red-50 p-3 text-red-600">
                    {errorMessage || 'There was an error submitting your request.'}
                  </div>
                )}

                <BookingFormActions />
              </Form>
            )
          }}
        </Formik>
      )}
    </Modal>
  )
}
