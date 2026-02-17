import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Slice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import type { BookingFormData, LocationObject } from '@/lib/types'

export const initialBookingFormData: BookingFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  paymentMethod: 'cash',
  hotelRoomNumber: '',
  parkingInstructions: '',
  additionalNotes: '',
  location: {
    street: '',
    city: '',
    zip: '',
  },
  locationString: '',
  bookingUrl: '',
  promo: '',
}

export const bookingFormSlice: Slice<BookingFormData> = createSlice({
  name: 'form',
  initialState: initialBookingFormData,
  reducers: {
    setBookingForm: (state, action: PayloadAction<Partial<BookingFormData>>) => {
      return { ...state, ...action.payload }
    },
  },
})

export const { setBookingForm } = bookingFormSlice.actions

export const selectBookingFormData = (state: RootState) => state.form

export default bookingFormSlice.reducer
