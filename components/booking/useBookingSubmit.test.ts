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

  it('fires raffle submit when raffleOptIn is true and booking succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    global.fetch = fetchMock

    const { result } = renderHook(() =>
      useBookingSubmit({ additionalData: {}, endPoint: '/api/request' })
    )

    await act(async () => {
      await result.current(
        {
          ...baseValues,
          raffleOptIn: true,
          raffleZipCode: '90210',
          raffleInterestedIn: ['in_home'],
        } as unknown as BookingFormValues,
        formikHelpers
      )
    })

    const raffleCalls = fetchMock.mock.calls.filter(([url]) => url === '/api/raffle/submit')
    expect(raffleCalls).toHaveLength(1)
    const body = JSON.parse(raffleCalls[0][1].body)
    expect(body.name).toBe('John Doe')
    expect(body.email).toBe('john@test.com')
    expect(body.zip_code).toBe('90210')
    expect(body.interested_in).toEqual(['in_home'])
  })

  it('does not fire raffle submit when raffleOptIn is false', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
    global.fetch = fetchMock

    const { result } = renderHook(() =>
      useBookingSubmit({ additionalData: {}, endPoint: '/api/request' })
    )

    await act(async () => {
      await result.current(baseValues, formikHelpers)
    })

    const raffleCalls = fetchMock.mock.calls.filter(([url]) => url === '/api/raffle/submit')
    expect(raffleCalls).toHaveLength(0)
  })

  it('does not fire raffle submit when booking fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 500,
      ok: false,
      json: () => Promise.resolve({ error: 'server error' }),
    })
    global.fetch = fetchMock

    const { result } = renderHook(() =>
      useBookingSubmit({ additionalData: {}, endPoint: '/api/request' })
    )

    await act(async () => {
      await result.current(
        { ...baseValues, raffleOptIn: true } as unknown as BookingFormValues,
        formikHelpers
      )
    })

    const raffleCalls = fetchMock.mock.calls.filter(([url]) => url === '/api/raffle/submit')
    expect(raffleCalls).toHaveLength(0)
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
