import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Slice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import type { DiscountType, SlugConfigurationType, LocationObject } from 'lib/types'
import { DEFAULT_PRICING } from 'config'

export const initialState: SlugConfigurationType = {
  type: null,
  bookingSlug: null,
  pricing: DEFAULT_PRICING,
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
  promoEndDate: null,
  customFields: undefined,
}

export const configSlice: Slice<SlugConfigurationType> = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setBookingSlug: (state, action: PayloadAction<string>) => {
      state.bookingSlug = action.payload
    },
    setPrice: (state, action: PayloadAction<{ [key: number]: number }>) => {
      state.pricing = action.payload
    },
    setAllowedDurations: (state, action: PayloadAction<number[] | null>) => {
      state.allowedDurations = action.payload
    },
    setLocation: (state, action: PayloadAction<LocationObject | null>) => {
      state.location = action.payload
    },
    setLocationReadOnly: (state, action: PayloadAction<boolean>) => {
      state.locationIsReadOnly = action.payload
    },
    updateLocationField: (
      state,
      action: PayloadAction<{ field: keyof LocationObject; value: string }>
    ) => {
      if (state.location) {
        state.location[action.payload.field] = action.payload.value
      } else {
        state.location = {
          street: '',
          city: '',
          zip: '',
        }
        state.location[action.payload.field] = action.payload.value
      }
    },
    setEventContainer: (state, action: PayloadAction<string>) => {
      // console.log('[configSlice]', action)
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
      // console.log('[configSlice]', action.payload)
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
  updateLocationField,
  configSliceReset,
} = configSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectConfig = (state: RootState) => state.config

export default configSlice.reducer
