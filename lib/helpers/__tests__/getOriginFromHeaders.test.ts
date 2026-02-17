import { describe, it, expect, vi, afterEach } from 'vitest'
import { getOriginFromHeaders } from '../getOriginFromHeaders'

function makeHeaders(entries: Record<string, string>): Headers {
  return new Headers(entries)
}

describe('getOriginFromHeaders', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns origin header when present', () => {
    const headers = makeHeaders({ origin: 'https://preview-abc.vercel.app' })
    expect(getOriginFromHeaders(headers)).toBe('https://preview-abc.vercel.app')
  })

  it('constructs from host header when origin is missing', () => {
    const headers = makeHeaders({ host: 'my-branch.vercel.app' })
    expect(getOriginFromHeaders(headers)).toBe('https://my-branch.vercel.app')
  })

  it('falls back to NEXT_PUBLIC_SITE_URL when no request headers', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.trilliummassage.la')
    const headers = makeHeaders({})
    expect(getOriginFromHeaders(headers)).toBe('https://staging.trilliummassage.la')
  })

  it('falls back to production URL as last resort', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    const headers = makeHeaders({})
    expect(getOriginFromHeaders(headers)).toBe('https://trilliummassage.la')
  })

  it('prefers origin over host', () => {
    const headers = makeHeaders({
      origin: 'https://from-origin.com',
      host: 'from-host.com',
    })
    expect(getOriginFromHeaders(headers)).toBe('https://from-origin.com')
  })
})
