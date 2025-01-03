/**
 * @jest-environment jsdom
 */

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
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))
jest.mock('@/redux/slices/modalSlice', () => ({
  setModal: jest.fn(),
}))

describe('BookingForm', () => {
  let dispatchRedux: jest.MockedFunction<AppDispatch>
  let router: ReturnType<typeof useRouter>

  beforeEach(() => {
    dispatchRedux = jest.fn()
    router = {
      push: jest.fn(),
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
      back: jest.fn(),
      beforePopState: jest.fn(),
      prefetch: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isLocaleDomain: false,
      forward: jest.fn(),
    } as unknown as jest.Mocked<NextRouter>
    ;(useRouter as jest.Mock).mockReturnValue(router)
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
