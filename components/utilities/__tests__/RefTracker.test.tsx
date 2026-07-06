import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import RefTracker from '@/components/utilities/RefTracker'
import { encodeRef, decodeRef } from '@/lib/ref/refCodec'

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

  it('captures the opaque ref code verbatim as event and person properties', () => {
    setSearch('?ref=Dg8CAxdR')
    render(<RefTracker />)

    expect(captureMock).toHaveBeenCalledWith('ref_link_visit', {
      ref: 'Dg8CAxdR',
      $set: { latest_ref: 'Dg8CAxdR' },
      $set_once: { initial_ref: 'Dg8CAxdR' },
    })
  })

  it('captures nothing when ref param is absent', () => {
    setSearch('?duration=90')
    render(<RefTracker />)

    expect(captureMock).not.toHaveBeenCalled()
  })

  it('captures only once across re-renders', () => {
    setSearch('?ref=Dg8CAxdR')
    const { rerender } = render(<RefTracker />)
    rerender(<RefTracker />)

    expect(captureMock).toHaveBeenCalledTimes(1)
  })
})

describe('refCodec — secret-keyed encode/decode', () => {
  const secret = 'test-secret-key'

  it('round-trips a client tag through encode and decode', () => {
    const code = encodeRef('jane-2', secret)
    expect(decodeRef(code, secret)).toBe('jane-2')
  })

  it('produces URL-safe codes with no padding or +/ characters', () => {
    const code = encodeRef('client with spaces & symbols!', secret)
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('does not decode to the tag without the right secret', () => {
    const code = encodeRef('jane-2', secret)
    expect(decodeRef(code, 'wrong-secret')).not.toBe('jane-2')
  })

  it('is not plain base64 of the tag', () => {
    const code = encodeRef('jane-2', secret)
    expect(Buffer.from(code, 'base64url').toString('utf8')).not.toBe('jane-2')
  })

  it('throws when the secret is empty', () => {
    expect(() => encodeRef('jane-2', '')).toThrow()
    expect(() => decodeRef('abc', '')).toThrow()
  })
})
