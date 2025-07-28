import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Slice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import type { BookingFormData } from 'components/booking/types'
import type { ReviewFormData } from 'components/ReviewForm'
import { ReviewSnippetProps } from 'components/ReviewCard'

export const initialBookingFormData: BookingFormData = {
  /** First name of the requester */
  firstName: '',
  /** Last name of the requester */
  lastName: '',
  /** Email address of the requester */
  email: '',
  /** Address of the requester */
  location: '',
  /** City of the requester */
  city: '',
  /** Zip code of the requester */
  zipCode: '',
  /** Phone number of the requester */
  phone: '',
  /** Payment method of the requester */
  paymentMethod: 'cash',
  /** Hotel room number */
  hotelRoomNumber: '',
  /** Parking instructions */
  parkingInstructions: '',
  /** Additional notes */
  additionalNotes: '',
}

export const initialReviewFormState: ReviewFormData = {
  /** Name of the requester */
  name: '',
  /** Fast name of the requester */
  firstName: '',
  /** Last name of the requester */
  lastName: '',
  /** Short review description */
  text: '',
  /** Datetime start */
  start: '',
  /** Datetime end */
  end: '',
  /** Ratings */
  rating: '',
}

export const initialReviewSnippetProps: ReviewSnippetProps = {
  name: '',
  text: '',
  date: '',
  rating: undefined,
}

type FormStateType = BookingFormData & ReviewFormData & ReviewSnippetProps

type FormState = FormStateType

const initialState: FormStateType = {
  ...initialBookingFormData,
  ...initialReviewFormState,
}

export const formSlice: Slice<FormStateType> = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setForm: (state, action: PayloadAction<Partial<FormStateType>>) => {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
})

export const { setForm } = formSlice.actions

export const selectFormData = (state: RootState) => state.form

export default formSlice.reducer
