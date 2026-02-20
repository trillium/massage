import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Slice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'

type ErrorType = 'retryable' | 'partial_success'

type ModalStateType = {
  status: 'open' | 'busy' | 'error' | 'closed'
  errorMessage?: string
  errorType?: ErrorType
  eventPageUrl?: string
}

const initialState: ModalStateType = { status: 'closed' }

export const modalSlice: Slice<ModalStateType> = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setModal: (state, action: PayloadAction<ModalStateType>) => {
      state.status = action.payload.status
      state.errorMessage = action.payload.errorMessage
      state.errorType = action.payload.errorType
      state.eventPageUrl = action.payload.eventPageUrl
    },
  },
})

export const { setModal } = modalSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectModal = (state: RootState) => state.modal

export default modalSlice.reducer
