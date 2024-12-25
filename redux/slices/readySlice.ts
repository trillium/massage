import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/redux/store"

type ObjReadyType = {
  [key: string]: boolean
}

const initialState: ObjReadyType = { Calendar: false, TimeList: false, hidden: true }

export const readySlice = createSlice({
  name: "ready",
  initialState,
  reducers: {
    setReady: (state, action: PayloadAction<ObjReadyType>) => {
      return (state = { ...state, ...action.payload })
    },
  },
})

export const { setReady } = readySlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectReady = (state: RootState) => state.ready

export default readySlice.reducer
