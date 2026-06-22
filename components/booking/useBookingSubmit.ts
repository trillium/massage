import posthog from 'posthog-js'
import { useRouter } from 'next/navigation'
import { FormikHelpers } from 'formik'
import { useAppDispatch, useReduxConfig } from '@/redux/hooks'
import { setModal } from '@/redux/slices/modalSlice'
import { setForm } from '@/redux/slices/formSlice'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { BookingFormValues } from '@/lib/bookingFormSchema'
import { useSlotHoldContext } from 'hooks/SlotHoldContext'
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
  const { sessionId } = useSlotHoldContext()

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
          telegramHandle: values.telegramHandle,
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
          telegramHandle: values.telegramHandle,
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
          sessionId,
          slugConfiguration: config,
          ...(additionalData.eventContainerString !== undefined
            ? { eventContainerString: additionalData.eventContainerString }
            : {}),
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

          if (response.status === 409 && json.error === 'slot_unavailable') {
            dispatch(setModal({ status: 'closed' }))
            const bookingUrl = json.bookingUrl || values.bookingUrl || '/'
            router.push(`${bookingUrl}?slotTaken=1`)
            return
          }

          if (json.success && response.ok) {
            if (values.raffleOptIn) {
              fetch('/api/raffle/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                keepalive: true,
                body: JSON.stringify({
                  name: `${values.firstName} ${values.lastName}`.trim(),
                  email: values.email,
                  phone: values.phone,
                  is_local: !!values.raffleZipCode?.trim(),
                  zip_code: values.raffleZipCode?.trim() || null,
                  interested_in: values.raffleInterestedIn ?? [],
                }),
              }).catch((err) => console.error('Raffle opt-in failed:', err))
            }

            dispatch(setModal({ status: 'closed' }))
            if (json.eventPageUrl) {
              router.push(json.eventPageUrl)
            } else if (json.instantConfirm) {
              router.push('/instantConfirm')
            } else {
              router.push('/confirmation')
            }
          } else {
            dispatch(setModal({ status: 'error' }))
          }
        } catch (error) {
          console.error('❌ [BookingForm] API call failed:', error)
          posthog.captureException(error, { context: 'booking-api-call', endpoint: endPoint })
          dispatch(setModal({ status: 'error' }))
        }
      }
    } catch (error) {
      console.error('❌ [BookingForm] Form submission error:', error)
      posthog.captureException(error, { context: 'booking-form-submission' })
      formikHelpers.setSubmitting(false)
    }
  }
}
