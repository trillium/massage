import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/redux/store"

type ModalStateType = { status: "open" | "busy" | "error" | "closed" }

const initialState: ModalStateType = { status: "closed" }

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setModal: (state, action: PayloadAction<ModalStateType>) => {
      state.status = action.payload.status 
    },
  },
})

export const { setModal } = modalSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectModal = (state: RootState) => state.modal

export default modalSlice.reducer
