import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/redux/store"
import type { DateTimeInterval } from "@/lib/types"

import Day from "@/lib/day"

type interval = {
  start: string
  end: string
}

type AvailabilityState = {
  /** The earliest day we’ll offer appointments */
  start: string
  /** The latest day we’ll offer appointments */
  end: string
  /** The day the user selected (if made) */
  selectedDate?: string
  /** The time slot the user selected (if made). */
  selectedTime?: interval
  /** The end user's timezone string */
  timeZone: string
  /** The number of minutes being requested,
   * must be one of the values in {@link ALLOWED_DURATIONS}
   */
  duration: number | null
}

const initialState: AvailabilityState = {
  duration: null,
  start: Day.todayWithOffset(0).toString(),
  end: Day.todayWithOffset(14).toString(),
  timeZone: "America/Los_Angeles",
}

export const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload
    },
    setSelectedTime: (state, action: PayloadAction<interval>) => {
      state.selectedTime = action.payload
    },
    setTimeZone: (state, action: PayloadAction<string>) => {
      state.timeZone = action.payload
    },
  },
})

export const { setDuration, setSelectedDate, setSelectedTime, setTimeZone } =
  availabilitySlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectAvailability = (state: RootState) => state.availability

export default availabilitySlice.reducer
