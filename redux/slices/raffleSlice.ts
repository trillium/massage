import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'

interface RaffleConfirmation {
  raffleName: string
  name: string
  email: string
  phone: string
  zip: string
  interests: string[]
}

const initialState: RaffleConfirmation | null = null

export const raffleSlice = createSlice({
  name: 'raffle',
  initialState: initialState as RaffleConfirmation | null,
  reducers: {
    setRaffleConfirmation: (_state, action: PayloadAction<RaffleConfirmation>) => {
      return action.payload
    },
    clearRaffleConfirmation: () => initialState,
  },
})

export const { setRaffleConfirmation, clearRaffleConfirmation } = raffleSlice.actions
export const selectRaffle = (state: RootState) => state.raffle
