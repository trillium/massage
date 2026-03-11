import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBookingSubmit } from './useBookingSubmit'
import type { BookingFormValues } from '@/lib/bookingFormSchema'
import type { FormikHelpers } from 'formik'

const mockPush = vi.fn()
const mockDispatch = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useReduxConfig: () => ({ instantConfirm: false }),
}))

vi.mock('@/redux/slices/modalSlice', () => ({
  setModal: vi.fn((payload) => ({ type: 'modal/setModal', payload })),
}))

vi.mock('@/redux/slices/formSlice', () => ({
  setForm: vi.fn((payload) => ({ type: 'form/setForm', payload })),
}))

vi.mock('hooks/SlotHoldContext', () => ({
  useSlotHoldContext: () => ({
    sessionId: 'test-session-id',
    holdId: null,
    claiming: false,
    claimHold: vi.fn(),
    releaseHold: vi.fn(),
  }),
}))

const baseValues = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  phone: '555-1234',
  location: { street: '', city: 'LA', zip: '90001' },
  start: '2024-06-15T10:00:00Z',
  end: '2024-06-15T11:00:00Z',
  duration: 60,
  timeZone: 'America/Los_Angeles',
  bookingUrl: '/scale23x',
  eventBaseString: 'scale23x',
} as unknown as BookingFormValues

const formikHelpers = {
  setSubmitting: vi.fn(),
} as unknown as FormikHelpers<BookingFormValues>

describe('useBookingSubmit - 409 handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to booking page with slotTaken param on 409', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 409,
      ok: false,
      json: () => Promise.resolve({ error: 'slot_unavailable', bookingUrl: '/scale23x' }),
    })

    const { result } = renderHook(() =>
      useBookingSubmit({ additionalData: {}, endPoint: '/api/request' })
    )

    await act(async () => {
      await result.current(baseValues, formikHelpers)
    })

    expect(mockPush).toHaveBeenCalledWith('/scale23x?slotTaken=1')
  })

  it('uses values.bookingUrl as fallback when response has no bookingUrl', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 409,
      ok: false,
      json: () => Promise.resolve({ error: 'slot_unavailable' }),
    })

    const { result } = renderHook(() =>
      useBookingSubmit({ additionalData: {}, endPoint: '/api/request' })
    )

    await act(async () => {
      await result.current(baseValues, formikHelpers)
    })

    expect(mockPush).toHaveBeenCalledWith('/scale23x?slotTaken=1')
  })

  it('does not show error modal on 409', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 409,
      ok: false,
      json: () => Promise.resolve({ error: 'slot_unavailable', bookingUrl: '/scale23x' }),
    })

    const { result } = renderHook(() =>
      useBookingSubmit({ additionalData: {}, endPoint: '/api/request' })
    )

    await act(async () => {
      await result.current(baseValues, formikHelpers)
    })

    const statusCalls = mockDispatch.mock.calls.map((c) => c[0]?.payload?.status).filter(Boolean)
    expect(statusCalls).not.toContain('error')
  })
})
