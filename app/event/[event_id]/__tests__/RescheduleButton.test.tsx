import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RescheduleButton from '../RescheduleButton'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const props = {
  eventId: 'event-123',
  token: 'valid-token',
  bookingUrl: '/book/massage?name=Test',
}

describe('RescheduleButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('shows initial button text', () => {
    render(<RescheduleButton {...props} />)
    expect(screen.getByRole('button', { name: 'Reschedule' })).toBeDefined()
  })

  it('enters confirmation state on first click', () => {
    render(<RescheduleButton {...props} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reschedule' }))

    expect(screen.getByRole('button', { name: 'Confirm Reschedule' })).toBeDefined()
    expect(screen.getByText(/cancel your current appointment/)).toBeDefined()
    expect(screen.getByRole('button', { name: 'Never mind' })).toBeDefined()
  })

  it('dismisses confirmation with "Never mind"', () => {
    render(<RescheduleButton {...props} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reschedule' }))
    fireEvent.click(screen.getByRole('button', { name: 'Never mind' }))

    expect(screen.getByRole('button', { name: 'Reschedule' })).toBeDefined()
  })

  it('calls cancel API with reschedule reason and redirects on confirm', async () => {
    vi.mocked(global.fetch).mockResolvedValue(new Response(JSON.stringify({ success: true })))

    render(<RescheduleButton {...props} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reschedule' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reschedule' }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/event/event-123/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'valid-token', reason: 'reschedule' }),
      })
      expect(mockPush).toHaveBeenCalledWith('/book/massage?name=Test')
    })
  })

  it('shows error on API failure', async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Token expired' }), { status: 403 })
    )

    render(<RescheduleButton {...props} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reschedule' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reschedule' }))

    expect(await screen.findByText('Token expired')).toBeDefined()
  })
})
