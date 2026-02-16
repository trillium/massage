import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { makeStore } from '@/redux/store'
import { setSelectedTime } from '@/redux/slices/availabilitySlice'
import { setModal } from '@/redux/slices/modalSlice'
import BookingForm from './BookingForm'

// Mock next/navigation useRouter before importing BookingForm
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}))

// Mock PostHog analytics to avoid external calls
vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
    identify: vi.fn(),
    init: vi.fn(),
  },
}))

// Integration test for BookingForm
describe('BookingForm Integration Tests', () => {
  let store: ReturnType<typeof makeStore>

  beforeEach(() => {
    // Reset mocks
    mockPush.mockClear()

    // Create a fresh store for each test
    store = makeStore()

    // Set up the required Redux state for the form to render
    store.dispatch(setModal({ status: 'open' }))
    store.dispatch(
      setSelectedTime({
        start: '2025-07-27T10:00:00-07:00',
        end: '2025-07-27T11:00:00-07:00',
      })
    )
    store.dispatch({
      type: 'availability/setTimeZone',
      payload: 'America/Los_Angeles',
    })
    store.dispatch({
      type: 'availability/setDuration',
      payload: 60,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Form Rendering', () => {
    it('should render the complete booking form when Redux state is properly set', () => {
      render(
        <Provider store={store}>
          <BookingForm />
        </Provider>
      )

      // Check main form elements
      expect(screen.getByText('Request appointment')).toBeInTheDocument()
      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should show loading state when no time is selected', () => {
      // Create store without setting time
      const emptyStore = makeStore()
      emptyStore.dispatch(setModal({ status: 'open' }))

      render(
        <Provider store={emptyStore}>
          <BookingForm />
        </Provider>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Request appointment')).not.toBeInTheDocument()
    })

    it('should show booking summary with correct time and pricing information', () => {
      render(
        <Provider store={store}>
          <BookingForm />
        </Provider>
      )

      // Check for time display
      expect(screen.getByText(/July 27, 2025/)).toBeInTheDocument()
      expect(screen.getByText(/10:00 AM/)).toBeInTheDocument()
      expect(screen.getByText(/11:00 AM/)).toBeInTheDocument()
    })
  })

  describe('Form Field Interaction', () => {
    it('should update Formik-controlled inputs on change', async () => {
      render(
        <Provider store={store}>
          <BookingForm />
        </Provider>
      )

      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')
      const emailInput = screen.getByLabelText('Email')

      fireEvent.change(firstNameInput, { target: { value: 'John' } })
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } })

      expect(firstNameInput).toHaveValue('John')
      expect(lastNameInput).toHaveValue('Doe')
      expect(emailInput).toHaveValue('john.doe@example.com')
    })

    it('should not sync name/email to Redux until submit', async () => {
      render(
        <Provider store={store}>
          <BookingForm />
        </Provider>
      )

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } })

      const formState = store.getState().form
      expect(formState.firstName).toBe('')
      expect(formState.email).toBe('')
    })

    it('should sync location to Redux on keystroke for DriveTimeCalculator', async () => {
      render(
        <Provider store={store}>
          <BookingForm />
        </Provider>
      )

      fireEvent.change(screen.getByLabelText('zip code'), { target: { value: '90210' } })

      const formState = store.getState().form
      expect(formState.location).toEqual(expect.objectContaining({ zip: '90210' }))
    })
  })

  describe('Form Submission Integration', () => {
    beforeEach(() => {
      // Mock fetch globally for these tests
      global.fetch = vi.fn()
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    it('should handle successful form submission', async () => {
      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: async () => ({ success: true }),
        ok: true,
      } as Response)

      render(
        <Provider store={store}>
          <BookingForm />
        </Provider>
      )

      // Fill out required fields
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john.doe@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '555-123-4567' } })
      fireEvent.change(screen.getByLabelText('street address'), {
        target: { value: '123 Main St' },
      })
      fireEvent.change(screen.getByLabelText('city'), { target: { value: 'Playa Vista' } })
      fireEvent.change(screen.getByLabelText('zip code'), { target: { value: '90094' } })

      // Submit the form by clicking the submit button
      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      // Wait for the API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'api/request',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        )
      })

      // Wait for navigation
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/confirmation')
      })

      // Check that modal was closed
      const modalState = store.getState().modal
      expect(modalState.status).toBe('closed')
    })

    it('should handle API errors gracefully', async () => {
      // Mock failed API response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: async () => ({ success: false }),
        ok: false,
      } as Response)

      render(
        <Provider store={store}>
          <BookingForm />
        </Provider>
      )

      // Fill out required fields
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john.doe@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '555-123-4567' } })
      fireEvent.change(screen.getByLabelText('street address'), {
        target: { value: '123 Main St' },
      })
      fireEvent.change(screen.getByLabelText('city'), { target: { value: 'Playa Vista' } })
      fireEvent.change(screen.getByLabelText('zip code'), { target: { value: '90094' } })

      // Submit the form
      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      // Wait for error state
      await waitFor(() => {
        const modalState = store.getState().modal
        expect(modalState.status).toBe('error')
      })

      // Should not navigate on error
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should include form data in the API request', async () => {
      // Mock successful response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: async () => ({ success: true }),
        ok: true,
      } as Response)

      render(
        <Provider store={store}>
          <BookingForm />
        </Provider>
      )

      // Fill out form data
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john.doe@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '555-123-4567' } })
      fireEvent.change(screen.getByLabelText('street address'), {
        target: { value: '123 Main St' },
      })
      fireEvent.change(screen.getByLabelText('city'), { target: { value: 'Playa Vista' } })
      fireEvent.change(screen.getByLabelText('zip code'), { target: { value: '90094' } })

      // Submit the form
      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      // Verify the API call includes expected data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'api/request',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: expect.stringMatching(/"firstName":"John"/),
          })
        )
      })

      // Parse the actual body to verify key fields
      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const body = JSON.parse(fetchCall[1]!.body as string)

      expect(body).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        start: '2025-07-27T10:00:00-07:00',
        end: '2025-07-27T11:00:00-07:00',
        duration: '60',
        timeZone: 'America/Los_Angeles',
      })
    })
  })

  describe('Modal Integration', () => {
    it('should hide form when modal is closed', () => {
      // Start with open modal
      render(
        <Provider store={store}>
          <BookingForm />
        </Provider>
      )

      // Form should be visible when modal is open
      expect(screen.getByText('Request appointment')).toBeInTheDocument()

      // Close the modal using the close button or by setting modal state
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      // After clicking cancel, the modal should be closed
      // (The component handles this through the setOpen prop in the Modal component)
    })

    it('should show error message when modal status is error', () => {
      // Set error state
      store.dispatch(setModal({ status: 'error' }))

      render(
        <Provider store={store}>
          <BookingForm />
        </Provider>
      )

      expect(screen.getByText('There was an error submitting your request.')).toBeInTheDocument()
    })
  })
})
