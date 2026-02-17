import { useDispatch, useSelector, useStore } from 'react-redux'
import type { RootState, AppDispatch, AppStore } from '@/redux/store'
import { selectAvailability } from '@/redux/slices/availabilitySlice'
import { selectModal } from '@/redux/slices/modalSlice'
import { selectBookingFormData } from '@/redux/slices/bookingFormSlice'
import { selectReviewFormData } from '@/redux/slices/reviewFormSlice'
import { selectEventContainers } from '@/redux/slices/eventContainersSlice'
import { selectConfig } from '@/redux/slices/configSlice'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()

// Custom hook to select availability state
export const useReduxAvailability = () => {
  return useAppSelector(selectAvailability)
}
export const useReduxModal = () => {
  return useAppSelector(selectModal)
}
export const useReduxFormData = () => {
  return useAppSelector(selectBookingFormData)
}
export const useReduxReviewFormData = () => {
  return useAppSelector(selectReviewFormData)
}
export const useReduxEventContainers = () => {
  return useAppSelector(selectEventContainers)
}
export const useReduxConfig = () => {
  return useAppSelector(selectConfig)
}
