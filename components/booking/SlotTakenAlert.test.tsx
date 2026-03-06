import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SlotTakenAlert from './SlotTakenAlert'

const mockRefresh = vi.fn()
const mockGet = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: mockGet, toString: () => '' }),
  useRouter: () => ({ refresh: mockRefresh }),
  usePathname: () => '/scale23x',
}))

describe('SlotTakenAlert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
  })

  it('renders nothing when slotTaken param is absent', () => {
    mockGet.mockReturnValue(null)
    const { container } = render(<SlotTakenAlert />)
    expect(container.innerHTML).toBe('')
  })

  it('shows warning when slotTaken=1', () => {
    mockGet.mockReturnValue('1')
    render(<SlotTakenAlert />)
    expect(screen.getByText(/just booked by someone else/)).toBeDefined()
  })

  it('calls router.refresh to reload availability', () => {
    mockGet.mockReturnValue('1')
    render(<SlotTakenAlert />)
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('cleans slotTaken from the URL', () => {
    mockGet.mockReturnValue('1')
    render(<SlotTakenAlert />)
    expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/scale23x')
  })

  it('hides when dismiss is clicked', async () => {
    mockGet.mockReturnValue('1')
    render(<SlotTakenAlert />)
    fireEvent.click(screen.getByText('Dismiss'))
    await waitFor(() => {
      expect(screen.queryByText(/just booked by someone else/)).toBeNull()
    })
  })
})
