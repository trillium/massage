import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Slice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import type {
  BookingFormData,
  ReviewFormData,
  ReviewSnippetProps,
  LocationObject,
} from '@/lib/types'

export const initialBookingFormData: BookingFormData = {
  /** First name of the requester */
  firstName: '',
  /** Last name of the requester */
  lastName: '',
  /** Email address of the requester */
  email: '',
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
  /** Location object for new form structure */
  location: {
    street: '',
    city: '',
    zip: '',
  },
  /** Location as formatted string */
  locationString: '',
  /** URL where this booking was made from */
  bookingUrl: '',
  /** Promotional offer applied to this booking */
  promo: '',
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

export type FormStateType = BookingFormData & ReviewFormData & ReviewSnippetProps

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
