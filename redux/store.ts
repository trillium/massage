import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { bookingFormSlice } from './slices/bookingFormSlice'
import { reviewFormSlice } from './slices/reviewFormSlice'
import { availabilitySlice } from './slices/availabilitySlice'
import { modalSlice } from './slices/modalSlice'
import { readySlice } from './slices/readySlice'
import { eventContainersSlice } from './slices/eventContainersSlice'
import { configSlice } from './slices/configSlice'

const rootReducer = combineSlices(
  bookingFormSlice,
  reviewFormSlice,
  availabilitySlice,
  modalSlice,
  readySlice,
  eventContainersSlice,
  configSlice
)

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
