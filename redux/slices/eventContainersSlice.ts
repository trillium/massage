import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/redux/store"

export type EventContainerType = {
  location?: string
  eventBaseString: string
  eventMemberString: string
  eventContainerString: string
}

export const initialEventContainerState: EventContainerType = {
  /** Address of the container */
  location: "",
  /** Query string for finding all events/members */
  eventBaseString: "",
  /** Query string for finding all members */
  eventMemberString: "",
  /** Query string for finding all containers */
  eventContainerString: "",
}

const initialState: EventContainerType = {
  ...initialEventContainerState,
}

export const eventContainersSlice = createSlice({
  name: "eventContainers",
  initialState,
  reducers: {
    setEventContainers: (
      state,
      action: PayloadAction<Partial<EventContainerType>>
    ) => {
      return {
        ...state,
        ...action.payload,
      }
    },
    clearEventContainers: () => {
      return {
        ...initialState,
      }
    },
  },
})

export const { setEventContainers, clearEventContainers } = eventContainersSlice.actions

export const selectEventContainers = (state: RootState) => state.eventContainers

export default eventContainersSlice.reducer
