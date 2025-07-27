import { useCallback } from 'react'
import { setForm } from '@/redux/slices/formSlice'
import { useAppDispatch, useReduxFormData } from '@/redux/hooks'

export function useBookingFormChange() {
  const dispatchRedux = useAppDispatch()
  const formData = useReduxFormData()

  return useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const target = event.target as HTMLInputElement
      dispatchRedux(setForm({ ...formData, [target.name]: target.value }))
    },
    [dispatchRedux, formData]
  )
}
