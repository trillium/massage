import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import type { DiscountType, SlugConfigurationType } from 'lib/types'
import { ALLOWED_DURATIONS, DEFAULT_PRICING, LEAD_TIME } from 'config'

const initialState: SlugConfigurationType = {
  bookingSlug: null,
  price: undefined,
  allowedDurations: undefined,
  title: undefined,
  text: undefined,
  location: undefined,
  editLocation: true,
  eventContainer: undefined,
  discount: undefined,
  leadTimeMinimum: LEAD_TIME, // in minutes,
  instantConfirm: false,
  acceptingPayment: true,
}

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setBookingSlug: (state, action: PayloadAction<string>) => {
      state.bookingSlug = action.payload
    },
    setPrice: (state, action: PayloadAction<{ [key: number]: number }>) => {
      state.price = action.payload
    },
    setAllowedDurations: (state, action: PayloadAction<number[]>) => {
      state.allowedDurations = action.payload
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload
    },
    setEditLocation: (state, action: PayloadAction<boolean>) => {
      state.editLocation = action.payload
    },
    setEventContainer: (state, action: PayloadAction<string>) => {
      state.eventContainer = action.payload
    },
    setDiscount: (state, action: PayloadAction<DiscountType>) => {
      state.discount = action.payload
    },
    setLeadTimeMinimum: (state, action: PayloadAction<number>) => {
      state.leadTimeMinimum = action.payload
    },
    setInstantConfirm: (state, action: PayloadAction<boolean>) => {
      state.instantConfirm = action.payload
    },
    setAcceptingPayment: (state, action: PayloadAction<boolean>) => {
      state.acceptingPayment = action.payload
    },
    setBulkConfigSliceState: (state, action: PayloadAction<Partial<SlugConfigurationType>>) => {
      state = { ...state, ...action.payload }
    },
  },
})

export const {
  setBookingSlug,
  setPrice,
  setAllowedDurations,
  setLocation,
  setEditLocation,
  setEventContainer,
  setDiscount,
  setLeadTimeMinimum,
  setInstantConfirm,
  setAcceptingPayment,
  setBulkConfigSliceState,
} = configSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectConfig = (state: RootState) => state.config

export default configSlice.reducer
