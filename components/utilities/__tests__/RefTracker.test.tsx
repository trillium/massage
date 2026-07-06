import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import RefTracker, { decodeRef } from '@/components/utilities/RefTracker'

const captureMock = vi.fn()

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: captureMock }),
}))

function setSearch(search: string) {
  window.history.replaceState({}, '', `/${search}`)
}

describe('decodeRef', () => {
  it('round-trips a base64url-encoded client tag', () => {
    expect(decodeRef(btoa('jane-2'))).toBe('jane-2')
  })

  it('handles base64url alphabet (- and _) and rejects garbage', () => {
    expect(decodeRef('amFuZS0y')).toBe('jane-2')
    expect(decodeRef('!!not-base64!!')).toBeNull()
    expect(decodeRef('a')).toBeNull()
  })
})

describe('RefTracker — ref param capture', () => {
  beforeEach(() => {
    captureMock.mockClear()
  })

  it('decodes a base64url ref and stamps decoded value on person properties', () => {
    setSearch('?ref=amFuZS0y')
    render(<RefTracker />)

    expect(captureMock).toHaveBeenCalledWith('ref_link_visit', {
      ref: 'amFuZS0y',
      ref_decoded: 'jane-2',
      $set: { latest_ref: 'jane-2' },
      $set_once: { initial_ref: 'jane-2' },
    })
  })

  it('falls back to the raw ref when it is not decodable base64url', () => {
    setSearch('?ref=qr-lobby')
    render(<RefTracker />)

    expect(captureMock).toHaveBeenCalledWith('ref_link_visit', {
      ref: 'qr-lobby',
      ref_decoded: undefined,
      $set: { latest_ref: 'qr-lobby' },
      $set_once: { initial_ref: 'qr-lobby' },
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
