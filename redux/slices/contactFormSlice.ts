import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import type { ContactFormType } from '@/lib/types'

const initialState: ContactFormType = {
  subject: '',
  name: '',
  email: '',
  phone: '',
  message: '',
}

export const contactFormSlice = createSlice({
  name: 'contactForm',
  initialState,
  reducers: {
    setContactForm: (_state, action: PayloadAction<ContactFormType>) => {
      return action.payload
    },
    clearContactForm: () => initialState,
  },
})

export const { setContactForm, clearContactForm } = contactFormSlice.actions
export const selectContactForm = (state: RootState) => state.contactForm
