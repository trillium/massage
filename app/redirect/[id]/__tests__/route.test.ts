import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const capture = vi.fn()
const flush = vi.fn(() => Promise.resolve())

vi.mock('posthog-node', () => ({
  PostHog: vi.fn(() => ({ capture, flush })),
}))

import { GET } from '../route'

function scan(slug: string, headers: Record<string, string> = {}) {
  const request = new NextRequest(`https://trilliummassage.la/redirect/${slug}`, { headers })
  return GET(request, { params: Promise.resolve({ id: slug }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY_PROD', 'phc_test')
  vi.stubEnv('NEXT_PUBLIC_DISABLE_POSTHOG', 'false')
})

describe('/redirect/[id]', () => {
  it('captures a redirect_scanned event and 302s to the destination', async () => {
    const response = await scan('airbnb-flyer', {
      'user-agent': 'TestScanner/1.0',
      referer: 'https://example.com/',
    })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('https://airbnb.com/sv/trillium')
    expect(capture).toHaveBeenCalledTimes(1)
    const call = capture.mock.calls[0][0]
    expect(call.event).toBe('redirect_scanned')
    expect(call.distinctId).toMatch(/^scan-/)
    expect(call.properties).toMatchObject({
      source: 'flyer',
      campaign: 'office-flyer',
      concept: 'airbnb-flyer',
      slug: 'airbnb-flyer',
      destination: 'https://airbnb.com/sv/trillium',
      user_agent: 'TestScanner/1.0',
      referrer: 'https://example.com/',
    })
    expect(flush).toHaveBeenCalled()
  })

  it('still redirects when PostHog capture throws', async () => {
    flush.mockRejectedValueOnce(new Error('network down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await scan('airbnb-flyer')

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('https://airbnb.com/sv/trillium')
  })

  it('sends unknown slugs to the home page without capturing', async () => {
    const response = await scan('does-not-exist')

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://trilliummassage.la/')
    expect(capture).not.toHaveBeenCalled()
  })

  it('does not handle untracked static redirects', async () => {
    const response = await scan('test_abc123')

    expect(response.headers.get('location')).toBe('https://trilliummassage.la/')
    expect(capture).not.toHaveBeenCalled()
  })
})
