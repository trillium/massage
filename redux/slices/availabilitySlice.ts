import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Slice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import type { IntervalType, StringDateTimeIntervalAndLocation } from 'lib/types'
import Day from 'lib/day'
import { ALLOWED_DURATIONS } from 'config'

type AvailabilityState = {
  /** The earliest day we'll offer appointments */
  start: string
  /** The latest day we'll offer appointments */
  end: string
  /** The day the user selected (if made) */
  selectedDate?: string
  /** The time slot the user selected (if made). */
  selectedTime?: IntervalType
  /** The end user's timezone string */
  timeZone: string
  /** The number of minutes being requested,
   * must be one of the values in {@link ALLOWED_DURATIONS}
   */
  duration: number | null
  slots: StringDateTimeIntervalAndLocation[]
  /** Drive time in minutes from user's location to current event */
  driveTime: number | null
}

const initialState: AvailabilityState = {
  duration: null,
  start: Day.todayWithOffset(0).toString(),
  end: Day.todayWithOffset(14).toString(),
  timeZone: 'America/Los_Angeles',
  slots: [],
  driveTime: null,
}

export const availabilitySlice: Slice<AvailabilityState> = createSlice({
  name: 'availability',
  initialState,
  reducers: {
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload
    },
    setSelectedTime: (state, action: PayloadAction<IntervalType>) => {
      state.selectedTime = action.payload
    },
    setTimeZone: (state, action: PayloadAction<string>) => {
      state.timeZone = action.payload
    },
    setSlots: (state, action: PayloadAction<StringDateTimeIntervalAndLocation[]>) => {
      state.slots = action.payload
    },
    setDriveTime: (state, action: PayloadAction<number | null>) => {
      state.driveTime = action.payload
    },
  },
})

export const {
  setDuration,
  setSelectedDate,
  setSelectedTime,
  setTimeZone,
  setSlots,
  setDriveTime,
} = availabilitySlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectAvailability = (state: RootState) => state.availability

export default availabilitySlice.reducer
