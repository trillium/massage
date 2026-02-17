/**
 * @deprecated Import from bookingFormSlice or reviewFormSlice directly.
 * This file exists for backwards compatibility during migration.
 */
export {
  bookingFormSlice as formSlice,
  setBookingForm as setForm,
  selectBookingFormData as selectFormData,
  initialBookingFormData,
} from './bookingFormSlice'

export { initialReviewFormState, initialReviewSnippetProps } from './reviewFormSlice'

import type { BookingFormData, ReviewFormData, ReviewSnippetProps } from '@/lib/types'

/** @deprecated Use BookingFormData or ReviewFormState instead */
export type FormStateType = BookingFormData & ReviewFormData & ReviewSnippetProps

export { default } from './bookingFormSlice'
