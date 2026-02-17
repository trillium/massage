import type { FormEvent } from 'react'
import type { AppDispatch } from '@/redux/store'
import { setModal } from '@/redux/slices/modalSlice'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export function handleReviewSubmit(
  event: FormEvent<HTMLFormElement>,
  dispatch: AppDispatch,
  router: AppRouterInstance
) {
  event.preventDefault()
  dispatch(setModal({ status: 'busy' }))
  const jsonData = Object.fromEntries(new FormData(event.currentTarget))
  fetch(`/api/review/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jsonData),
  })
    .then(async (data) => {
      const json = await data.json()
      if (json.success) {
        dispatch(setModal({ status: 'closed' }))
        router.push('/reviews/submitted')
      } else {
        dispatch(setModal({ status: 'error' }))
      }
    })
    .catch(() => {
      dispatch(setModal({ status: 'error' }))
    })
}
