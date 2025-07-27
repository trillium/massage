import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Slice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import type { DiscountType, SlugConfigurationType } from 'lib/types'
import { DEFAULT_PRICING } from 'config'

export const initialState: SlugConfigurationType = {
  type: null,
  bookingSlug: null,
  price: DEFAULT_PRICING,
  allowedDurations: null,
  title: null,
  text: null,
  location: null,
  locationIsReadOnly: false,
  eventContainer: null,
  discount: null,
  leadTimeMinimum: null, // in minutes,
  instantConfirm: false,
  acceptingPayment: true,
}

export const configSlice: Slice<SlugConfigurationType> = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setBookingSlug: (state, action: PayloadAction<string>) => {
      state.bookingSlug = action.payload
    },
    setPrice: (state, action: PayloadAction<{ [key: number]: number }>) => {
      state.price = action.payload
    },
    setAllowedDurations: (state, action: PayloadAction<number[] | null>) => {
      state.allowedDurations = action.payload
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload
    },
    setLocationReadOnly: (state, action: PayloadAction<boolean>) => {
      state.locationIsReadOnly = action.payload
    },
    setEventContainer: (state, action: PayloadAction<string>) => {
      state.eventContainer = action.payload
    },
    setDiscount: (state, action: PayloadAction<DiscountType>) => {
      state.discount = action.payload
    },
    setLeadTimeMinimum: (state, action: PayloadAction<number | null>) => {
      state.leadTimeMinimum = action.payload
    },
    setInstantConfirm: (state, action: PayloadAction<boolean>) => {
      state.instantConfirm = action.payload
    },
    setAcceptingPayment: (state, action: PayloadAction<boolean>) => {
      state.acceptingPayment = action.payload
    },
    setBulkConfigSliceState: (state, action: PayloadAction<Partial<SlugConfigurationType>>) => {
      Object.assign(state, action.payload)
    },
    configSliceReset: (state) => {
      state = { ...initialState }
    },
  },
})

export const {
  setBookingSlug,
  setPrice,
  setAllowedDurations,
  setLocation,
  setEventContainer,
  setDiscount,
  setLeadTimeMinimum,
  setInstantConfirm,
  setAcceptingPayment,
  setBulkConfigSliceState,
  setLocationReadOnly,
  configSliceReset,
} = configSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectConfig = (state: RootState) => state.config

export default configSlice.reducer
