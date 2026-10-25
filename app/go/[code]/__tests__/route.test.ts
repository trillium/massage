import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { encodeRef } from '@/lib/ref/refCodec'

const capture = vi.fn()
const flush = vi.fn(() => Promise.resolve())

vi.mock('posthog-node', () => ({
  PostHog: vi.fn(() => ({ capture, flush })),
}))

import { GET } from '../route'

const SECRET = 'test-secret'
const DESTINATION = 'https://airbnb.com/sv/trillium'

function scan(code: string, headers: Record<string, string> = {}) {
  const request = new NextRequest(`https://trilliummassage.la/go/${code}`, { headers })
  return GET(request, { params: Promise.resolve({ code }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY_PROD', 'phc_test')
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY_DEV', 'phc_test')
  vi.stubEnv('NEXT_PUBLIC_DISABLE_POSTHOG', 'false')
  vi.stubEnv('NEXT_PUBLIC_REF_CODE_SECRET', SECRET)
})

describe('/go/[code]', () => {
  it('captures ref_link_visit with the decoded flyer tag and 302s to Airbnb', async () => {
    const code = encodeRef('af-1', SECRET)

    const response = await scan(code, {
      'user-agent': 'TestScanner/1.0',
      referer: 'https://example.com/',
    })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(DESTINATION)
    expect(capture).toHaveBeenCalledTimes(1)
    const call = capture.mock.calls[0][0]
    expect(call.event).toBe('ref_link_visit')
    expect(call.distinctId).toMatch(/^scan-/)
    expect(call.properties).toMatchObject({
      ref: code,
      ref_decoded: 'af-1',
      source: 'flyer',
      destination: DESTINATION,
      user_agent: 'TestScanner/1.0',
      referrer: 'https://example.com/',
    })
    expect(flush).toHaveBeenCalled()
  })

  it('still redirects and captures with ref_decoded null for an unknown code', async () => {
    const response = await scan('zzzzzzzzzzzzzzzzzzzz')

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(DESTINATION)
    expect(capture.mock.calls[0][0].properties.ref_decoded).toBeNull()
  })

  it('still redirects when PostHog capture throws', async () => {
    flush.mockRejectedValueOnce(new Error('network down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await scan(encodeRef('af-1', SECRET))

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(DESTINATION)
  })

  it('redirects without capturing when PostHog is disabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_DISABLE_POSTHOG', 'true')

    const response = await scan(encodeRef('af-1', SECRET))

    expect(response.status).toBe(302)
    expect(capture).not.toHaveBeenCalled()
  })
})
