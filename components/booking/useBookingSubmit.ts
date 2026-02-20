import { useRouter } from 'next/navigation'
import { FormikHelpers } from 'formik'
import { useAppDispatch, useReduxConfig } from '@/redux/hooks'
import { setModal } from '@/redux/slices/modalSlice'
import { setForm } from '@/redux/slices/formSlice'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { BookingFormValues } from '@/lib/bookingFormSchema'
import { ChairAppointmentBlockProps } from 'lib/types'

type UseBookingSubmitParams = {
  additionalData: Partial<ChairAppointmentBlockProps>
  endPoint: string
  onSubmit?: (values: BookingFormValues, formikHelpers: FormikHelpers<BookingFormValues>) => void
}

export function useBookingSubmit({ additionalData, endPoint, onSubmit }: UseBookingSubmitParams) {
  const dispatch = useAppDispatch()
  const config = useReduxConfig()
  const router = useRouter()

  return async (values: BookingFormValues, formikHelpers: FormikHelpers<BookingFormValues>) => {
    try {
      dispatch(setModal({ status: 'busy' }))
      const locationString = flattenLocation(values.location)

      dispatch(
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
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
          locationString: locationString,
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
          rescheduleEventId: values.rescheduleEventId || undefined,
          rescheduleToken: values.rescheduleToken || undefined,
          slugConfiguration: config,
          ...additionalData,
        }

        try {
          const response = await fetch(endPoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(30_000),
          })

          const json = await response.json()

          if (json.success && response.ok) {
            dispatch(setModal({ status: 'closed' }))
            if (json.eventPageUrl) {
              router.push(json.eventPageUrl)
            } else if (json.instantConfirm) {
              router.push('/instantConfirm')
            } else {
              router.push('/confirmation')
            }
          } else {
            dispatch(
              setModal({
                status: 'error',
                errorMessage: json.error,
                errorType: json.errorType,
                eventPageUrl: json.eventPageUrl,
              })
            )
          }
        } catch (error) {
          console.error('❌ [BookingForm] API call failed:', error)
          const isTimeout = error instanceof DOMException && error.name === 'TimeoutError'
          dispatch(
            setModal({
              status: 'error',
              errorMessage: isTimeout
                ? 'The request timed out. Please check your connection and try again.'
                : 'Something went wrong. Please try again.',
              errorType: 'retryable',
            })
          )
        }
      }
    } catch (error) {
      console.error('❌ [BookingForm] Form submission error:', error)
      formikHelpers.setSubmitting(false)
    }
  }
}
