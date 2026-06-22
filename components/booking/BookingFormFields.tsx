import clsx from 'clsx'
import { FormikErrors, FormikTouched } from 'formik'

import NameFields from './fields/NameFields'
import ContactFields from './fields/ContactFields'
import PhoneField from './fields/PhoneField'
import LocationField from './fields/LocationField'
import EmailField from './fields/EmailField'
import PaymentMethodField from './fields/PaymentMethodField'
import HotelField from './fields/HotelField'
import ParkingField from './fields/ParkingField'
import NotesField from './fields/NotesField'
import PromoCodeField from './fields/PromoCodeField'
import RaffleOptInField from './fields/RaffleOptInField'
import ConnectedRoleField from './fields/ConnectedRoleField'
import RequestSoonerField from './fields/RequestSoonerField'

import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { TextSm } from '@/components/ui/text'
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
  hideLocation?: boolean
  acceptingPayment: boolean
  showHotelField?: boolean
  showParkingField?: boolean
  showNotesField?: boolean
  showPromoField?: boolean
  showRaffleOptIn?: boolean
  showRoleField?: boolean
  showRequestSoonerField?: boolean
  allowTelegramContact?: boolean
}

export default function BookingFormFields({
  values,
  errors,
  touched,
  setFieldValue,
  setFieldTouched,
  locationReadOnly,
  locationWarning,
  hideLocation,
  acceptingPayment,
  showHotelField,
  showParkingField,
  showNotesField,
  showPromoField,
  showRaffleOptIn,
  showRoleField,
  showRequestSoonerField,
  allowTelegramContact,
}: BookingFormFieldsProps) {
  const dispatch = useAppDispatch()

  return (
    <Stack direction="col" gap={4}>
      <Box className="isolate -space-y-px rounded-md shadow-sm">
        <NameFields
          firstName={values.firstName}
          lastName={values.lastName}
          onChange={(e) => {
            setFieldValue(e.target.name, e.target.value)
          }}
        />
        {touched.firstName && errors.firstName && (
          <TextSm as="div" status="error" className="mt-1">
            {errors.firstName}
          </TextSm>
        )}
        {touched.lastName && errors.lastName && (
          <TextSm as="div" status="error" className="mt-1">
            {errors.lastName}
          </TextSm>
        )}

        {allowTelegramContact ? (
          <ContactFields
            phone={values.phone}
            telegramHandle={values.telegramHandle}
            onChange={(e) => {
              setFieldValue(e.target.name, e.target.value)
            }}
          />
        ) : (
          <PhoneField
            phone={values.phone}
            onChange={(e) => {
              setFieldValue('phone', e.target.value)
            }}
          />
        )}
        {(touched.phone || touched.telegramHandle) && errors.phone && (
          <TextSm as="div" status="error" className="mt-1">
            {errors.phone}
          </TextSm>
        )}

        {!hideLocation && (
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
        )}

        <EmailField
          email={values.email}
          onChange={(e) => {
            setFieldValue('email', e.target.value)
          }}
        />
        {touched.email && errors.email && (
          <TextSm as="div" status="error" className="mt-1">
            {errors.email}
          </TextSm>
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
              <TextSm as="div" status="error" className="mt-1">
                {errors.hotelRoomNumber}
              </TextSm>
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
              <TextSm as="div" status="error" className="mt-1">
                {errors.parkingInstructions}
              </TextSm>
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
              <TextSm as="div" status="error" className="mt-1">
                {errors.additionalNotes}
              </TextSm>
            )}
          </>
        )}

        {showPromoField && (
          <PromoCodeField
            promoCode={values.promo ?? ''}
            error={touched.promo && errors.promo ? errors.promo : undefined}
            onChange={(e) => {
              setFieldValue('promo', e.target.value)
            }}
          />
        )}
      </Box>

      <Box
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
      </Box>

      {acceptingPayment && (
        <>
          <PaymentMethodField
            selected={values.paymentMethod}
            onChange={(e) => {
              setFieldValue('paymentMethod', e.target.value as PaymentMethodType)
            }}
          />
          {touched.paymentMethod && errors.paymentMethod && (
            <TextSm as="div" status="error" className="mt-1">
              {errors.paymentMethod}
            </TextSm>
          )}
        </>
      )}

      {showRaffleOptIn && (
        <RaffleOptInField
          optIn={values.raffleOptIn ?? false}
          zipCode={values.raffleZipCode ?? ''}
          interestedIn={values.raffleInterestedIn ?? []}
          onChange={setFieldValue}
        />
      )}

      {showRoleField && <ConnectedRoleField />}

      {showRequestSoonerField && (
        <RequestSoonerField
          checked={values.requestSooner ?? false}
          onChange={(v) => setFieldValue('requestSooner', v)}
        />
      )}
    </Stack>
  )
}
