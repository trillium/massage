import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Slice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import type { ReviewFormData, ReviewSnippetProps } from '@/lib/types'

export type ReviewFormState = ReviewFormData & ReviewSnippetProps

export const initialReviewFormState: ReviewFormData = {
  name: '',
  firstName: '',
  lastName: '',
  text: '',
  start: '',
  end: '',
  rating: '',
}

export const initialReviewSnippetProps: ReviewSnippetProps = {
  name: '',
  text: '',
  date: '',
  rating: undefined,
}

const initialState: ReviewFormState = {
  ...initialReviewFormState,
  ...initialReviewSnippetProps,
}

export const reviewFormSlice: Slice<ReviewFormState> = createSlice({
  name: 'reviewForm',
  initialState,
  reducers: {
    setReviewForm: (state, action: PayloadAction<Partial<ReviewFormState>>) => {
      return { ...state, ...action.payload }
    },
  },
})

export const { setReviewForm } = reviewFormSlice.actions

export const selectReviewFormData = (state: RootState) => state.reviewForm

export default reviewFormSlice.reducer
