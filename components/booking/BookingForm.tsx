'use client'

import { DialogTitle } from '@headlessui/react'
import { Formik, Form, FormikHelpers } from 'formik'
import { PostHogErrorBoundary } from 'posthog-js/react'

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
  useReduxEdgeRole,
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
import { useSlotHoldContext } from 'hooks/SlotHoldContext'
import booking from '@/data/booking.json'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

type BookingFormProps = {
  additionalData?: Partial<ChairAppointmentBlockProps>
  acceptingPayment?: boolean
  endPoint?: string
  onSubmit?: (values: BookingFormValues, formikHelpers: FormikHelpers<BookingFormValues>) => void
  showRaffleOptIn?: boolean
}

export default function BookingForm({
  additionalData = {},
  endPoint = 'api/request',
  acceptingPayment = true,
  onSubmit,
  showRaffleOptIn,
}: BookingFormProps) {
  const dispatch = useAppDispatch()
  const { releaseHold, holdExpired, claimHold, claiming } = useSlotHoldContext()
  const formData = useReduxFormData()
  const eventContainers = useReduxEventContainers()
  const config = useReduxConfig()
  const { status: modal } = useReduxModal()
  const { selectedTime, timeZone, duration } = useReduxAvailability()
  const price =
    duration && config.pricing ? config.pricing[duration] : DEFAULT_PRICING[duration] || 'null'

  const edgeRoleRaw = useReduxEdgeRole()
  const isEdgeContext =
    !!config?.customFields?.showRoleField || !!config?.customFields?.forceRole
  const edgeRole = isEdgeContext ? edgeRoleRaw : undefined

  const rawRoleHint =
    edgeRole && config.customFields?.roleHints ? config.customFields.roleHints[edgeRole] : undefined
  const roleHint = rawRoleHint
    ? typeof rawRoleHint === 'string'
      ? rawRoleHint
      : duration
        ? rawRoleHint[duration]
        : undefined
    : undefined
  const pricingLabel = roleHint ?? (duration ? config.pricingLabels?.[duration] : undefined)
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
    edgeMemberType: edgeRole,
  })
  const handleFormSubmit = useBookingSubmit({ additionalData, endPoint, onSubmit })

  const showHotelField = !!(additionalData?.showHotelField || config?.customFields?.showHotelField)
  const showParkingField = !!(
    additionalData?.showParkingField || config?.customFields?.showParkingField
  )
  const showNotesField = !!(additionalData?.showNotesField || config?.customFields?.showNotesField)
  const showPromoField = !!(additionalData?.showPromoField || config?.customFields?.showPromoField)
  const resolvedShowRaffleOptIn = !!(
    showRaffleOptIn ??
    additionalData?.showRaffleOptIn ??
    config?.customFields?.showRaffleOptIn
  )
  const showRoleField = !!config?.customFields?.showRoleField
  const showRequestSoonerField = !!config?.customFields?.showRequestSoonerField
  const allowTelegramContact = !!config?.customFields?.allowTelegramContact
  const locationReadOnly = !!eventContainers?.location || config.locationIsReadOnly
  const hideLocation = !!config.hideLocation

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
    <PostHogErrorBoundary>
      <Modal
        open={modal !== 'closed'}
        setOpen={(open) => {
          if (!open) releaseHold()
          dispatch(setModal({ status: open ? 'open' : 'closed' }))
        }}
      >
        {!selectedTime || !timeZone ? (
          <Stack className="min-h-[200px]" direction="row" align="center" justify="center">
            {booking.flow.loading}
          </Stack>
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
                  <Stack direction="row" align="center" justify="between">
                    <DialogTitle
                      as="h3"
                      className="text-base leading-6 font-semibold text-accent-900 dark:text-accent-100"
                    >
                      {booking.flow.requestAppointment}
                    </DialogTitle>
                    {holdExpired && (
                      <Button
                        type="button"
                        disabled={claiming}
                        onClick={() => {
                          if (selectedTime) claimHold(selectedTime.start, selectedTime.end)
                        }}
                        className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                      >
                        {claiming ? booking.flow.reserving : booking.flow.reserveAgain}
                      </Button>
                    )}
                  </Stack>

                  <BookingSummary
                    dateString={dateString}
                    startString={startString}
                    endString={endString}
                    price={price}
                    pricingLabel={pricingLabel}
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
                    hideLocation={hideLocation}
                    acceptingPayment={acceptingPayment}
                    showHotelField={showHotelField}
                    showParkingField={showParkingField}
                    showNotesField={showNotesField}
                    showPromoField={showPromoField}
                    showRaffleOptIn={resolvedShowRaffleOptIn}
                    showRoleField={showRoleField}
                    showRequestSoonerField={showRequestSoonerField}
                    allowTelegramContact={allowTelegramContact}
                  />

                  {modal === 'error' && (
                    <Box className="mt-4 rounded-md bg-red-50 p-3 text-red-600">
                      {booking.flow.errorSubmitting}
                    </Box>
                  )}

                  <BookingFormActions />
                </Form>
              )
            }}
          </Formik>
        )}
      </Modal>
    </PostHogErrorBoundary>
  )
}
