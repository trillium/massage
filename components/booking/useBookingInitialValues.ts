import { useMemo } from 'react'
import { PaymentMethodType, IntervalType } from 'lib/types'
import { stringToLocationObject } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import { BookingFormValues } from '@/lib/bookingFormSchema'
import { SlugConfigurationType } from 'lib/configTypes'
import { EventContainerType } from '@/redux/slices/eventContainersSlice'
import { FormStateType } from '@/redux/slices/formSlice'
import siteMetadata from 'data/siteMetadata'

const { eventBaseString } = siteMetadata

type UseBookingInitialValuesParams = {
  formData: FormStateType
  eventContainers: EventContainerType
  config: SlugConfigurationType
  selectedTime: IntervalType | undefined
  timeZone: string | null
  duration: number
  acceptingPayment: boolean
  price: number | string
}

export function useBookingInitialValues({
  formData,
  eventContainers,
  config,
  selectedTime,
  timeZone,
  duration,
  acceptingPayment,
  price,
}: UseBookingInitialValuesParams): BookingFormValues {
  return useMemo(
    () => ({
      firstName: formData.firstName || config.prefillFirstName || '',
      lastName: formData.lastName || config.prefillLastName || '',
      phone: formData.phone || config.prefillPhone || '',
      email: formData.email || config.prefillEmail || '',
      location: (() => {
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
    }),
    [formData, eventContainers, config, selectedTime, timeZone, duration, acceptingPayment, price]
  )
}
