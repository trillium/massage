import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import RefTracker from '@/components/utilities/RefTracker'
import { encodeRef, decodeRef, tryDecodeRef } from '@/lib/ref/refCodec'

const secret = 'test-secret-key'
vi.stubEnv('NEXT_PUBLIC_REF_CODE_SECRET', secret)

const captureMock = vi.fn()
const fetchMock = vi.fn(() => Promise.resolve({ ok: true }))
vi.stubGlobal('fetch', fetchMock)

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: captureMock }),
}))

function setSearch(search: string) {
  window.history.replaceState({}, '', `/${search}`)
}

describe('RefTracker — ref param capture', () => {
  beforeEach(() => {
    captureMock.mockClear()
    fetchMock.mockClear()
  })

  it('pings the server /api/ref endpoint so it can tag the person server-side', () => {
    const code = encodeRef('jane-2', secret)
    setSearch(`?ref=${code}`)
    render(<RefTracker />)

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/ref?ref=${encodeURIComponent(code)}`,
      expect.objectContaining({ credentials: 'same-origin' })
    )
  })

  it('decodes a secret-keyed ref code and stamps decoded value on person properties', () => {
    const code = encodeRef('jane-2', secret)
    setSearch(`?ref=${code}`)
    render(<RefTracker />)

    expect(captureMock).toHaveBeenCalledWith('ref_link_visit', {
      ref: code,
      ref_decoded: 'jane-2',
      $set: { latest_ref: 'jane-2' },
      $set_once: { initial_ref: 'jane-2' },
    })
  })

  it('falls back to the raw ref when the code is not decodable', () => {
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
    setSearch(`?ref=${encodeRef('jane-2', secret)}`)
    const { rerender } = render(<RefTracker />)
    rerender(<RefTracker />)

    expect(captureMock).toHaveBeenCalledTimes(1)
  })
})

describe('refCodec — secret-keyed encode/decode', () => {
  it('round-trips a client tag through encode and decode', () => {
    const code = encodeRef('jane-2', secret)
    expect(decodeRef(code, secret)).toBe('jane-2')
  })

  it('produces pure alphanumeric codes — no underscores, hyphens, or padding', () => {
    for (const tag of ['jane-2', 'client with spaces & symbols!', 'a1', 'francesca-w4']) {
      expect(encodeRef(tag, secret)).toMatch(/^[A-Za-z0-9]+$/)
    }
  })

  it('round-trips tags whose XORed bytes start with zero', () => {
    const zeroLeading = String.fromCharCode(secret.charCodeAt(0)) + 'ane-2'
    const code = encodeRef(zeroLeading, secret)
    expect(decodeRef(code, secret)).toBe(zeroLeading)
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

  it('tryDecodeRef returns null for garbage instead of throwing', () => {
    expect(tryDecodeRef('!!not-base64!!', secret)).toBeNull()
    expect(tryDecodeRef('a', secret)).toBeNull()
    expect(tryDecodeRef(encodeRef('jane-2', secret), secret)).toBe('jane-2')
  })
})
