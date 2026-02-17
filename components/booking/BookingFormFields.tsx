import clsx from 'clsx'
import { FormikErrors, FormikTouched } from 'formik'

import NameFields from './fields/NameFields'
import PhoneField from './fields/PhoneField'
import LocationField from './fields/LocationField'
import EmailField from './fields/EmailField'
import PaymentMethodField from './fields/PaymentMethodField'
import HotelField from './fields/HotelField'
import ParkingField from './fields/ParkingField'
import NotesField from './fields/NotesField'

import { setForm } from '@/redux/slices/formSlice'
import { useAppDispatch } from '@/redux/hooks'
import { PaymentMethodType } from 'lib/types'
import { BookingFormValues } from '@/lib/bookingFormSchema'

const LOCATION_FIELD_MAP: Record<string, string> = {
  location: 'street',
  city: 'city',
  zipCode: 'zip',
}

type BookingFormFieldsProps = {
  values: BookingFormValues
  errors: FormikErrors<BookingFormValues>
  touched: FormikTouched<BookingFormValues>
  setFieldValue: (field: string, value: unknown) => void
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  locationReadOnly?: boolean
  locationWarning?: string
  acceptingPayment: boolean
  showHotelField?: boolean
  showParkingField?: boolean
  showNotesField?: boolean
}

export default function BookingFormFields({
  values,
  errors,
  touched,
  setFieldValue,
  setFieldTouched,
  locationReadOnly,
  locationWarning,
  acceptingPayment,
  showHotelField,
  showParkingField,
  showNotesField,
}: BookingFormFieldsProps) {
  const dispatch = useAppDispatch()

  return (
    <div className="flex flex-col space-y-4">
      <div className="isolate -space-y-px rounded-md shadow-sm">
        <NameFields
          firstName={values.firstName}
          lastName={values.lastName}
          onChange={(e) => {
            setFieldValue(e.target.name, e.target.value)
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
          }}
        />
        {touched.phone && errors.phone && (
          <div className="mt-1 text-sm text-red-600">{errors.phone}</div>
        )}

        <LocationField
          location={values.location}
          readOnly={!!locationReadOnly}
          onChange={(e) => {
            const locationField = LOCATION_FIELD_MAP[e.target.name]
            if (!locationField) return

            setFieldValue(`location.${locationField}`, e.target.value)

            const updatedLocation = {
              ...values.location,
              [locationField]: e.target.value,
            }
            dispatch(setForm({ location: updatedLocation }))
          }}
          onBlur={(e) => {
            const locationField = LOCATION_FIELD_MAP[e.target.name]
            if (!locationField) return

            setFieldTouched(`location.${locationField}`, true, true)
          }}
          validationConfig={{ cities: ['Playa Vista'] }}
          errors={{
            street:
              touched.location?.street && errors.location?.street
                ? errors.location.street
                : undefined,
            city:
              touched.location?.city && errors.location?.city ? errors.location.city : undefined,
            zip: touched.location?.zip && errors.location?.zip ? errors.location.zip : undefined,
          }}
        />

        <EmailField
          email={values.email}
          onChange={(e) => {
            setFieldValue('email', e.target.value)
          }}
        />
        {touched.email && errors.email && (
          <div className="mt-1 text-sm text-red-600">{errors.email}</div>
        )}

        {showHotelField && (
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

        {showParkingField && (
          <>
            <ParkingField
              parkingInstructions={values.parkingInstructions || ''}
              onChange={(e) => {
                setFieldValue('parkingInstructions', e.target.value)
              }}
            />
            {touched.parkingInstructions && errors.parkingInstructions && (
              <div className="mt-1 text-sm text-red-600">{errors.parkingInstructions}</div>
            )}
          </>
        )}

        {showNotesField && (
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
  )
}
