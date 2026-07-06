import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import RefTracker from '@/components/utilities/RefTracker'

const captureMock = vi.fn()

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: captureMock }),
}))

function setSearch(search: string) {
  window.history.replaceState({}, '', `/${search}`)
}

describe('RefTracker — ref param capture', () => {
  beforeEach(() => {
    captureMock.mockClear()
  })

  it('captures ref_link_visit with event and person properties when ?ref= is present', () => {
    setSearch('?ref=jane-d')
    render(<RefTracker />)

    expect(captureMock).toHaveBeenCalledWith('ref_link_visit', {
      ref: 'jane-d',
      $set: { latest_ref: 'jane-d' },
      $set_once: { initial_ref: 'jane-d' },
    })
  })

  it('captures nothing when ref param is absent', () => {
    setSearch('?duration=90')
    render(<RefTracker />)

    expect(captureMock).not.toHaveBeenCalled()
  })

  it('captures only once across re-renders', () => {
    setSearch('?ref=jane-d')
    const { rerender } = render(<RefTracker />)
    rerender(<RefTracker />)

    expect(captureMock).toHaveBeenCalledTimes(1)
  })
})
