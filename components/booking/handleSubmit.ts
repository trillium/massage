import type { FormEvent } from 'react'
import type { AppDispatch } from '@/redux/store'
import { setModal } from '@/redux/slices/modalSlice'
import { setForm } from '@/redux/slices/formSlice'
import type { ChairAppointmentBlockProps } from 'lib/types'

/**
 * Builds the payload for booking form submission.
 * @param formData FormData from the form event
 * @param additionalData Any additional data to merge
 */
export function buildBookingPayload(formData: FormData, additionalData: object = {}) {
  return {
    ...Object.fromEntries(formData),
    ...additionalData,
  }
}

/**
 * Handles form submissions by intercepting the native event,
 * passing params to the `/book` endpoint, and redirecting
 * upon success (or showing a failure message).
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
  router: ReturnType<typeof import('next/navigation').useRouter>
  additionalData: Partial<ChairAppointmentBlockProps>
  endPoint: string
}) {
  event.preventDefault()
  dispatchRedux(setModal({ status: 'busy' }))
  const payload = buildBookingPayload(new FormData(event.currentTarget), additionalData)
  fetch(endPoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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
