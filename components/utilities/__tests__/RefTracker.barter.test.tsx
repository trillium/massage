import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import RefTracker from '@/components/utilities/RefTracker'
import { buildBarterUrl } from '@/lib/ref/barter'

const secret = 'test-secret-key'
vi.stubEnv('NEXT_PUBLIC_REF_CODE_SECRET', secret)

const captureMock = vi.fn()
const fetchMock = vi.fn(() => Promise.resolve({ ok: true }))
vi.stubGlobal('fetch', fetchMock)

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: captureMock }),
}))

describe('RefTracker — minted barter link', () => {
  beforeEach(() => {
    captureMock.mockClear()
    fetchMock.mockClear()
  })

  it('captures ref_link_visit with the b-<show>-<client> tag when visiting a minted barter URL', () => {
    const minted = new URL(
      buildBarterUrl('SCaLE 23x', 'DJ Beard', 'https://trilliummassage.la', secret)
    )
    const code = minted.searchParams.get('ref') as string
    window.history.replaceState({}, '', `${minted.pathname}${minted.search}`)

    render(<RefTracker />)

    expect(captureMock).toHaveBeenCalledWith('ref_link_visit', {
      ref: code,
      ref_decoded: 'b-scale23x-dj-beard',
      $set: { latest_ref: 'b-scale23x-dj-beard' },
      $set_once: { initial_ref: 'b-scale23x-dj-beard' },
    })
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/ref?ref=${encodeURIComponent(code)}`,
      expect.objectContaining({ credentials: 'same-origin' })
    )
  })
})
