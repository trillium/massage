import { useCallback } from 'react'
import { setForm } from '@/redux/slices/formSlice'
import { useAppDispatch, useReduxFormData } from '@/redux/hooks'
import { LocationObject } from 'lib/types'

export function useBookingFormChange() {
  const dispatchRedux = useAppDispatch()
  const formData = useReduxFormData()

  return useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const target = event.target as HTMLInputElement
      const { name, value } = target

      // Handle location object fields specially
      if (name === 'location' || name === 'city' || name === 'zipCode') {
        const currentLocation: LocationObject = formData.location || {
          street: '',
          city: '',
          zip: '',
        }
        let updatedLocation: LocationObject

        if (name === 'location') {
          updatedLocation = { ...currentLocation, street: value }
        } else if (name === 'city') {
          updatedLocation = { ...currentLocation, city: value }
        } else if (name === 'zipCode') {
          updatedLocation = { ...currentLocation, zip: value }
        } else {
          updatedLocation = currentLocation
        }

        dispatchRedux(setForm({ ...formData, location: updatedLocation }))
      } else {
        dispatchRedux(setForm({ ...formData, [name]: value }))
      }
    },
    [dispatchRedux, formData]
  )
}
