// Mock next/navigation useRouter before importing BookingForm
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}))

import React from 'react'
import { render, screen } from '@testing-library/react'
import BookingForm from './BookingForm'
import { vi, describe, it, expect } from 'vitest'
import '@testing-library/jest-dom' // Importing jest-dom for custom matchers
import { Provider } from 'react-redux'
import { makeStore } from '@/redux/store'
import { setSelectedTime } from '@/redux/slices/availabilitySlice'
import { setModal } from '@/redux/slices/modalSlice'

// Integration test for BookingForm
describe('BookingForm integration', () => {
  it('should render and allow user to select a time without breaking', () => {
    const store = makeStore()
    // Initial render: no time selected, BookingForm should render nothing
    const { rerender } = render(
      <Provider store={store}>
        <BookingForm endPoint="/api/book" />
      </Provider>
    )
    expect(screen.queryByText(/Request appointment/i)).toBeNull()

    // Simulate user selecting a time by dispatching to the store
    const dispatch = store.dispatch
    dispatch(setModal({ status: 'open' }))
    dispatch(
      setSelectedTime({
        start: '2025-06-14T10:00:00Z',
        end: '2025-06-14T11:00:00Z',
      })
    )
    dispatch({
      type: 'availability/setTimeZone',
      payload: 'America/New_York',
    })
    dispatch({
      type: 'availability/setDuration',
      payload: 60,
    })
    rerender(
      <Provider store={store}>
        <BookingForm endPoint="/api/book" />
      </Provider>
    )

    // Now the form should render
    expect(screen.getByText(/Request appointment/i)).toBeInTheDocument()
    // Optionally, check for other fields
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    // ✅ FIXED: Added city and zipCode field verification
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Zip code/i)).toBeInTheDocument()
  })
})
