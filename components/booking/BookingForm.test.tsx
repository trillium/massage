import { describe, it, expect, vi, beforeEach, type Mock, type Mocked } from 'vitest'
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import BookingForm from './BookingForm'
import { handleSubmit } from './BookingForm'
import { setModal } from '@/redux/slices/modalSlice'
import { useRouter, NextRouter } from 'next/router'
import { AppDispatch } from '@/redux/store'
import { ChairAppointmentBlockProps } from '@/lib/types'
import StoreProvider from 'app/StoreProvider'

// Mock dependencies
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}))
vi.mock('@/redux/slices/modalSlice', () => ({
  setModal: vi.fn(),
}))

describe('BookingForm', () => {
  let dispatchRedux: Mock
  let router: ReturnType<typeof useRouter>

  beforeEach(() => {
    dispatchRedux = vi.fn()
    router = {
      push: vi.fn(),
      route: '',
      pathname: '',
      query: {},
      asPath: '',
      basePath: '',
      locale: undefined,
      locales: undefined,
      defaultLocale: undefined,
      isFallback: false,
      isReady: true,
      isPreview: false,
      back: vi.fn(),
      beforePopState: vi.fn(),
      prefetch: vi.fn(),
      reload: vi.fn(),
      replace: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
      isLocaleDomain: false,
      forward: vi.fn(),
    } as unknown as Mocked<NextRouter>
    ;(useRouter as Mock).mockReturnValue(router)
  })

  it('should handle form submission correctly', async () => {
    const endPoint = '/book'

    const { getByLabelText, getByText } = render(
      <StoreProvider>
        <BookingForm endPoint={endPoint} />
      </StoreProvider>
    )

    // Fill out form fields
    fireEvent.change(getByLabelText(/name/i), { target: { value: 'John Doe' } })
    fireEvent.change(getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } })

    // Submit the form
    fireEvent.submit(getByText(/submit/i))

    await waitFor(() => {
      // Verify handleSubmit is called with correct parameters
      expect(dispatchRedux).toHaveBeenCalledWith(setModal({ status: 'busy' }))
      expect(fetch).toHaveBeenCalledWith(endPoint, expect.any(Object))
    })
  })
})
