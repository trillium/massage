import type { FormEvent } from 'react'
import type { AppDispatch } from '@/redux/store'
import { setModal } from '@/redux/slices/modalSlice'
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
 * passing params to the specified endpoint, and redirecting
 * upon success (or showing a failure message).
 * Can also handle mock scenarios with custom processing.
 */
export function handleSubmit({
  event,
  dispatchRedux,
  router,
  additionalData,
  endPoint,
  mockHandleSubmit,
}: {
  event: FormEvent<HTMLFormElement>
  dispatchRedux: AppDispatch
  router: ReturnType<typeof import('next/navigation').useRouter>
  additionalData: Partial<ChairAppointmentBlockProps>
  endPoint: string
  mockHandleSubmit?: (formData: FormData) => void
}) {
  event.preventDefault()

  // Extract FormData immediately while event is still valid
  const formData = new FormData(event.currentTarget)

  dispatchRedux(setModal({ status: 'busy' }))

  // Handle mock scenario
  if (mockHandleSubmit) {
    setTimeout(() => {
      try {
        mockHandleSubmit(formData)
        dispatchRedux(setModal({ status: 'closed' }))
      } catch (error) {
        console.error('Mock submission error:', error)
        dispatchRedux(setModal({ status: 'error' }))
      }
    }, 500)

    return
  }

  // Handle production scenario
  const payload = buildBookingPayload(formData, additionalData)
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
