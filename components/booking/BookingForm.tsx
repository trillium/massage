'use client'

import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { DialogTitle } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { Formik, Form, FormikHelpers } from 'formik'
import { z } from 'zod'

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
import { createLocationSchema } from './fields/validations/locationValidation'

import { DEFAULT_PRICING } from 'config'
import { setModal } from '@/redux/slices/modalSlice'
import { setForm } from '@/redux/slices/formSlice'
import {
  useAppDispatch,
  useReduxAvailability,
  useReduxFormData,
  useReduxEventContainers,
  useReduxModal,
  useReduxConfig,
} from '@/redux/hooks'
import { ChairAppointmentBlockProps, PaymentMethodType, LocationObject } from 'lib/types'
import siteMetadata from 'data/siteMetadata'
import BookingSummary from './BookingSummary'
import BookingFormActions from './BookingFormActions'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { stringToLocationObject } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import { createBookingFormSchema, BookingFormValues } from '@/lib/bookingFormSchema'

const { eventBaseString } = siteMetadata

// Define the props interface
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
  const dispatchRedux = useAppDispatch()
  const formData = useReduxFormData()
  const eventContainers = useReduxEventContainers()
  const config = useReduxConfig()
  const { status: modal } = useReduxModal()
  const { selectedTime, timeZone, duration } = useReduxAvailability()
  const price =
    duration && config.pricing ? config.pricing[duration] : DEFAULT_PRICING[duration] || 'null'
  const router = useRouter()

  // Store Formik's setFieldValue function so we can access it from useEffect
  const formikRef = useRef<{
    setFieldValue: (field: string, value: unknown) => void
  } | null>(null)

  // Function to sync Redux config location with Formik
  const setFormikLocation = (configLocation: LocationObject | string | null, source: string) => {
    if (configLocation && formikRef.current) {
      let newLocation: LocationObject

      // Handle both LocationObject and string types
      if (typeof configLocation === 'string') {
        // Use the existing stringToLocationObject function to parse the address
        newLocation = stringToLocationObject(configLocation)
      } else {
        // If it's a LocationObject, use its properties
        newLocation = {
          street: configLocation.street || '',
          city: configLocation.city || '',
          zip: configLocation.zip || '',
        }
      }

      formikRef.current.setFieldValue('location', newLocation)
    }
  }

  // Store pending location updates for when Formik is ready
  const pendingLocationUpdate = useRef<{
    location: LocationObject | string | null
    source: string
  } | null>(null)

  // Watch for changes to config.location and sync with Formik
  useEffect(() => {
    if (config.location) {
      if (formikRef.current) {
        setFormikLocation(config.location, 'config.location useEffect')
      } else {
        pendingLocationUpdate.current = {
          location: config.location,
          source: 'config.location useEffect (delayed)',
        }
      }
    }
  }, [config.location])

  // Also watch for eventContainers.location changes
  useEffect(() => {
    if (eventContainers?.location) {
      if (formikRef.current) {
        setFormikLocation(eventContainers.location, 'eventContainers.location useEffect')
      } else {
        pendingLocationUpdate.current = {
          location: eventContainers.location,
          source: 'eventContainers.location useEffect (delayed)',
        }
      }
    }
  }, [eventContainers?.location])

  // Create custom validation function from Zod schema
  const validateForm = (values: BookingFormValues) => {
    try {
      // Create schema without strict city validation for form blocking
      const schema = createBookingFormSchema({
        /* no cities restriction for validation */
      })
      schema.parse(values)
      return {}
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string | Record<string, string>> = {}
        error.issues.forEach((issue) => {
          if (issue.path.length === 0) return

          // Handle nested paths properly
          const path = issue.path.join('.')

          // For nested objects like location, we need to set the individual field errors
          if (issue.path.length > 1) {
            const [parent, ...childPath] = issue.path
            if (!errors[parent as string]) {
              errors[parent as string] = {}
            }
            errors[parent as string][childPath.join('.')] = issue.message
          } else {
            errors[path] = issue.message
          }
        })
        return errors
      }
      return {}
    }
  }

  // Separate function to check for warnings (non-blocking)
  const getLocationWarning = (location: LocationObject): string | undefined => {
    if (!config.locationWarning) return undefined

    const warning = config.locationWarning

    // Check if it's a city-based warning
    if ('city' in warning && location.city) {
      const normalizedInputCity = location.city.toLowerCase().trim()
      const normalizedWarningCity = warning.city.toLowerCase().trim()

      // If the input city matches the warning city, no warning needed
      if (normalizedInputCity === normalizedWarningCity) {
        return undefined
      }

      // Otherwise, show the warning
      return warning.message
    }

    // Check if it's a zip-based warning
    if ('zip' in warning && location.zip) {
      // If the input zip matches the warning zip, no warning needed
      if (location.zip === warning.zip) {
        return undefined
      }

      // Otherwise, show the warning
      return warning.message
    }

    return undefined
  }

  // Initial form values
  const initialValues: BookingFormValues = {
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    phone: formData.phone || '',
    email: formData.email || '',
    location: (() => {
      // Priority order: eventContainers > config > formData > default
      const locationSources = [eventContainers?.location, config?.location, formData?.location]

      for (const locationSource of locationSources) {
        if (locationSource) {
          if (typeof locationSource === 'string') {
            return stringToLocationObject(locationSource)
          } else {
            return locationSource
          }
        }
      }

      // Default empty location
      return { street: '', city: '', zip: '' }
    })(),
    instantConfirm: config.instantConfirm || false,
    paymentMethod: (formData.paymentMethod as PaymentMethodType) || 'cash',
    hotelRoomNumber: typeof formData.hotelRoomNumber === 'string' ? formData.hotelRoomNumber : '',
    parkingInstructions:
      typeof formData.parkingInstructions === 'string' ? formData.parkingInstructions : '',
    additionalNotes: typeof formData.additionalNotes === 'string' ? formData.additionalNotes : '',
    start: selectedTime?.start || '',
    end: selectedTime?.end || '',
    duration: duration || 0,
    price: acceptingPayment ? price : undefined,
    timeZone: timeZone || '',
    eventBaseString: eventBaseString,
    eventMemberString: eventContainers?.eventMemberString,
    bookingUrl: config?.bookingSlug
      ? `/${Array.isArray(config.bookingSlug) ? config.bookingSlug[0] : config.bookingSlug}`
      : undefined,
    promo: config?.discount
      ? config.discount.type === 'percent'
        ? `${(config.discount.amountPercent || 0) * 100}% off`
        : `$${config.discount.amountDollars || 0} off`
      : undefined,
  }

  const handleFormSubmit = async (
    values: BookingFormValues,
    formikHelpers: FormikHelpers<BookingFormValues>
  ) => {
    try {
      dispatchRedux(setModal({ status: 'busy' }))
      // Store form data in Redux for the confirmation page
      const locationString = flattenLocation(values.location)

      dispatchRedux(
        setForm({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          location: values.location,
          locationString: locationString,
          hotelRoomNumber: values.hotelRoomNumber,
          parkingInstructions: values.parkingInstructions,
          additionalNotes: values.additionalNotes,
          paymentMethod: values.paymentMethod,
          promo: values.promo,
          bookingUrl: values.bookingUrl,
        })
      )

      if (onSubmit) {
        await onSubmit(values, formikHelpers)
      } else {
        // Direct API call instead of complex FormData handling
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
          locationString: locationString, // Send location as string to API
          paymentMethod: values.paymentMethod,
          hotelRoomNumber: values.hotelRoomNumber || undefined,
          parkingInstructions: values.parkingInstructions || undefined,
          additionalNotes: values.additionalNotes || undefined,
          start: values.start,
          end: values.end,
          duration: values.duration.toString(),
          price: values.price ? values.price.toString() : undefined,
          timeZone: values.timeZone,
          eventBaseString: values.eventBaseString,
          eventMemberString: values.eventMemberString || undefined,
          bookingUrl: values.bookingUrl || undefined,
          promo: values.promo || undefined,
          instantConfirm: config.instantConfirm || false,
          slugConfiguration: config, // Include full slug configuration
          ...additionalData,
        }

        try {
          const response = await fetch(endPoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })

          const json = await response.json()

          if (json.success && response.ok) {
            dispatchRedux(setModal({ status: 'closed' }))
            if (json.instantConfirm) {
              router.push('/instantConfirm')
            } else {
              router.push('/confirmation')
            }
          } else {
            dispatchRedux(setModal({ status: 'error' }))
          }
        } catch (error) {
          console.error('❌ [BookingForm] API call failed:', error)
          dispatchRedux(setModal({ status: 'error' }))
        }
      }
    } catch (error) {
      console.error('❌ [BookingForm] Form submission error:', error)
      formikHelpers.setSubmitting(false)
    }
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
        <Formik
          initialValues={initialValues}
          validate={validateForm}
          onSubmit={handleFormSubmit}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
            setFieldTouched,
            isSubmitting,
            handleSubmit,
          }) => {
            // Store the setFieldValue function in the ref so useEffect can access it
            formikRef.current = { setFieldValue }

            // Process any pending location updates now that Formik is ready
            if (pendingLocationUpdate.current) {
              const { location, source } = pendingLocationUpdate.current
              setFormikLocation(location, source)
              pendingLocationUpdate.current = null // Clear after processing
            }

            // Get location warning (non-blocking) - only if location fields have been touched
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

                {/* Formik handles all form data - no hidden fields needed */}

                <BookingSummary
                  dateString={dateString}
                  startString={startString}
                  endString={endString}
                  price={price}
                  acceptingPayment={acceptingPayment}
                  discount={config.discount}
                  formData={{
                    ...values,
                    location: values.location,
                  }}
                />

                <div className="flex flex-col space-y-4">
                  <div className="isolate -space-y-px rounded-md shadow-sm">
                    <NameFields
                      firstName={values.firstName}
                      lastName={values.lastName}
                      onChange={(e) => {
                        setFieldValue(e.target.name, e.target.value)
                        // Also update Redux state for integration tests
                        dispatchRedux(setForm({ [e.target.name]: e.target.value }))
                      }}
                    />
                    {touched.firstName && errors.firstName && (
                      <div className="mt-1 text-sm text-red-600">{errors.firstName}</div>
                    )}
                    {touched.lastName && errors.lastName && (
                      <div className="mt-1 text-sm text-red-600">{errors.lastName}</div>
                    )}

                    <PhoneField
                      phone={values.phone}
                      onChange={(e) => {
                        setFieldValue('phone', e.target.value)
                        // Also update Redux state for integration tests
                        dispatchRedux(setForm({ phone: e.target.value }))
                      }}
                    />
                    {touched.phone && errors.phone && (
                      <div className="mt-1 text-sm text-red-600">{errors.phone}</div>
                    )}

                    <LocationField
                      location={values.location}
                      readOnly={
                        !!(eventContainers && eventContainers.location) || config.locationIsReadOnly
                      }
                      onChange={(e) => {
                        // Map the actual field names to the nested location structure
                        const fieldName = e.target.name
                        let locationField: string

                        switch (fieldName) {
                          case 'location':
                            locationField = 'street'
                            break
                          case 'city':
                            locationField = 'city'
                            break
                          case 'zipCode':
                            locationField = 'zip'
                            break
                          default:
                            return // Unknown field, ignore
                        }

                        setFieldValue(`location.${locationField}`, e.target.value)
                        // DO NOT set touched on change - only on blur!
                      }}
                      onBlur={(e) => {
                        // Map the field names for blur events
                        const fieldName = e.target.name
                        let locationField: string

                        switch (fieldName) {
                          case 'location':
                            locationField = 'street'
                            break
                          case 'city':
                            locationField = 'city'
                            break
                          case 'zipCode':
                            locationField = 'zip'
                            break
                          default:
                            return
                        }

                        setFieldTouched(`location.${locationField}`, true, true)
                      }}
                      validationConfig={{ cities: ['Playa Vista'] }}
                      errors={{
                        street:
                          touched.location?.street && errors.location?.street
                            ? errors.location.street
                            : undefined,
                        city:
                          touched.location?.city && errors.location?.city
                            ? errors.location.city
                            : undefined,
                        zip:
                          touched.location?.zip && errors.location?.zip
                            ? errors.location.zip
                            : undefined,
                      }}
                    />

                    <EmailField
                      email={values.email}
                      onChange={(e) => {
                        setFieldValue('email', e.target.value)
                        // Also update Redux state for integration tests
                        dispatchRedux(setForm({ email: e.target.value }))
                      }}
                    />
                    {touched.email && errors.email && (
                      <div className="mt-1 text-sm text-red-600">{errors.email}</div>
                    )}

                    {(additionalData?.showHotelField || config?.customFields?.showHotelField) && (
                      <>
                        <HotelField
                          hotelRoomNumber={values.hotelRoomNumber || ''}
                          onChange={(e) => {
                            setFieldValue('hotelRoomNumber', e.target.value)
                          }}
                        />
                        {touched.hotelRoomNumber && errors.hotelRoomNumber && (
                          <div className="mt-1 text-sm text-red-600">{errors.hotelRoomNumber}</div>
                        )}
                      </>
                    )}

                    {(additionalData?.showParkingField ||
                      config?.customFields?.showParkingField) && (
                      <>
                        <ParkingField
                          parkingInstructions={values.parkingInstructions || ''}
                          onChange={(e) => {
                            setFieldValue('parkingInstructions', e.target.value)
                          }}
                        />
                        {touched.parkingInstructions && errors.parkingInstructions && (
                          <div className="mt-1 text-sm text-red-600">
                            {errors.parkingInstructions}
                          </div>
                        )}
                      </>
                    )}

                    {(additionalData?.showNotesField || config?.customFields?.showNotesField) && (
                      <>
                        <NotesField
                          additionalNotes={values.additionalNotes || ''}
                          onChange={(e) => {
                            setFieldValue('additionalNotes', e.target.value)
                          }}
                        />
                        {touched.additionalNotes && errors.additionalNotes && (
                          <div className="mt-1 text-sm text-red-600">{errors.additionalNotes}</div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Location warning (non-blocking) - only show after field has been touched */}
                  {/* Animate location warning in/out with Tailwind transitions */}
                  <div
                    className={clsx(
                      'mt-1 transform rounded border-2 border-amber-200 bg-amber-50 p-2 text-sm text-amber-600 transition-all duration-300 ease-in-out dark:bg-amber-950/50 dark:text-amber-500',
                      {
                        'pointer-events-auto translate-y-0 opacity-100': locationWarning,
                        'pointer-events-none h-0 -translate-y-2 opacity-0': !locationWarning,
                      }
                    )}
                    aria-live="polite"
                  >
                    {locationWarning}
                  </div>

                  {acceptingPayment && (
                    <>
                      <PaymentMethodField
                        selected={values.paymentMethod}
                        onChange={(e) => {
                          setFieldValue('paymentMethod', e.target.value as PaymentMethodType)
                        }}
                      />
                      {touched.paymentMethod && errors.paymentMethod && (
                        <div className="mt-1 text-sm text-red-600">{errors.paymentMethod}</div>
                      )}
                    </>
                  )}
                </div>

                {modal === 'error' && (
                  <div className="mt-4 rounded-md bg-red-50 p-3 text-red-600">
                    There was an error submitting your request.
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
