import { describe, it, expect, vi, beforeEach, type Mock, type Mocked } from 'vitest'
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import BookingForm from './BookingForm'
import { handleSubmit } from './handleSubmit'
import { setModal } from '@/redux/slices/modalSlice'
import { useRouter } from 'next/navigation'
import { AppDispatch } from '@/redux/store'
import { ChairAppointmentBlockProps } from '@/lib/types'
import StoreProvider from 'app/StoreProvider'

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))
vi.mock('./handleSubmit', () => ({
  handleSubmit: vi.fn(),
}))
vi.mock('@/redux/slices/modalSlice', () => {
  const mockReducer = vi.fn((state = { status: 'closed' }) => state)
  const mockAction = vi.fn()
  const mockSelector = vi.fn(() => ({ status: 'closed' }))
  return {
    setModal: mockAction,
    selectModal: mockSelector,
    modalSlice: {
      reducer: mockReducer,
      actions: {
        setModal: mockAction,
      },
    },
    default: mockReducer,
  }
})

// Mock Redux hooks to provide required state
vi.mock('@/redux/hooks', () => ({
  useAppDispatch: vi.fn(() => vi.fn()),
  useReduxFormData: vi.fn(() => ({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    city: '',
    zipCode: '',
    phone: '',
    paymentMethod: 'cash',
  })),
  useReduxEventContainers: vi.fn(() => ({
    location: undefined,
    eventBaseString: undefined,
    eventMemberString: undefined,
    eventContainerString: undefined,
  })),
  useReduxModal: vi.fn(() => ({ status: 'open' })),
  useReduxAvailability: vi.fn(() => ({
    selectedTime: { start: '2025-07-27T10:00:00-07:00', end: '2025-07-27T11:00:00-07:00' },
    timeZone: 'America/Los_Angeles',
    duration: 60,
  })),
}))

// Mock global fetch
global.fetch = vi.fn()

describe('BookingForm', () => {
  let dispatchRedux: Mock
  let router: ReturnType<typeof useRouter>

  beforeEach(() => {
    dispatchRedux = vi.fn()
    router = {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as ReturnType<typeof useRouter>
    ;(useRouter as Mock).mockReturnValue(router)
  })

  it('should render something - basic rendering test', () => {
    const endPoint = '/book'

    const { getByText, getByLabelText } = render(
      <StoreProvider>
        <BookingForm endPoint={endPoint} />
      </StoreProvider>
    )

    // Check if form elements are rendered
    expect(getByText('Request appointment')).toBeTruthy()
    expect(getByLabelText('First Name')).toBeTruthy()
    expect(getByLabelText('Last Name')).toBeTruthy()
    expect(getByLabelText('Email')).toBeTruthy()
  })

  it('should handle form submission correctly', async () => {
    const endPoint = '/book'
    const mockHandleSubmit = handleSubmit as Mock

    const { getByLabelText, getByText } = render(
      <StoreProvider>
        <BookingForm endPoint={endPoint} />
      </StoreProvider>
    )

    // Fill out form fields
    fireEvent.change(getByLabelText('First Name'), { target: { value: 'John' } })
    fireEvent.change(getByLabelText('Last Name'), { target: { value: 'Doe' } })
    fireEvent.change(getByLabelText('Email'), { target: { value: 'john.doe@example.com' } })

    // Submit the form
    fireEvent.submit(getByText('Submit'))

    await waitFor(() => {
      // Verify handleSubmit is called with correct parameters
      expect(mockHandleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          endPoint,
          router: expect.any(Object),
          dispatchRedux: expect.any(Function),
        })
      )
    })
  })
})
