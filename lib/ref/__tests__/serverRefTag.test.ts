import { describe, it, expect, vi, beforeEach } from 'vitest'
import { encodeRef } from '@/lib/ref/refCodec'
import { tagReferral } from '@/lib/ref/serverRefTag'
import type { RefServerConfig } from '@/lib/ref/refServerConfig'

const captureMock = vi.fn()
const flushMock = vi.fn().mockResolvedValue(undefined)

vi.mock('posthog-node', () => ({
  PostHog: class {
    capture = captureMock
    flush = flushMock
  },
}))

const SECRET = 'unit-secret'

function config(overrides: Partial<RefServerConfig> = {}): RefServerConfig {
  return {
    disabled: false,
    secret: SECRET,
    host: 'https://ph.example.com',
    projectKey: 'phc_test',
    env: 'dev',
    eventName: 'referral_tagged',
    propReferredBy: 'referred_by',
    propRefToken: 'ref_token',
    fallback: 'defer',
    ...overrides,
  }
}

describe('tagReferral', () => {
  beforeEach(() => {
    captureMock.mockClear()
    flushMock.mockClear()
  })

  it('tags the visitor person with decoded referred_by + raw ref_token', async () => {
    const token = encodeRef('instagram-bio', SECRET)
    const result = await tagReferral(
      { refToken: token, distinctId: 'person-42' },
      { config: config() }
    )

    expect(result).toEqual({
      status: 'tagged',
      distinctId: 'person-42',
      referredBy: 'instagram-bio',
      refToken: token,
      generatedId: false,
    })
    expect(captureMock).toHaveBeenCalledWith({
      distinctId: 'person-42',
      event: 'referral_tagged',
      properties: {
        referred_by: 'instagram-bio',
        ref_token: token,
        $set: { referred_by: 'instagram-bio', ref_token: token },
      },
    })
    expect(flushMock).toHaveBeenCalledOnce()
  })

  it('honors env-configured property names', async () => {
    const token = encodeRef('flyer', SECRET)
    await tagReferral(
      { refToken: token, distinctId: 'p1' },
      { config: config({ propReferredBy: 'src', propRefToken: 'tok', eventName: 'ref_hit' }) }
    )
    expect(captureMock).toHaveBeenCalledWith({
      distinctId: 'p1',
      event: 'ref_hit',
      properties: { src: 'flyer', tok: token, $set: { src: 'flyer', tok: token } },
    })
  })

  it('defers (no capture) when there is no distinct_id cookie', async () => {
    const token = encodeRef('qr', SECRET)
    const result = await tagReferral({ refToken: token, distinctId: null }, { config: config() })
    expect(result).toMatchObject({ status: 'deferred', refToken: token })
    expect(captureMock).not.toHaveBeenCalled()
  })

  it('generates a throwaway id when fallback=generate', async () => {
    const token = encodeRef('qr', SECRET)
    const result = await tagReferral(
      { refToken: token, distinctId: '' },
      { config: config({ fallback: 'generate' }) }
    )
    expect(result.status).toBe('tagged')
    if (result.status === 'tagged') {
      expect(result.generatedId).toBe(true)
      expect(result.distinctId).toMatch(/^ref-anon-/)
    }
    expect(captureMock).toHaveBeenCalledWith(
      expect.objectContaining({ properties: expect.objectContaining({ ref_orphan: true }) })
    )
  })

  it('no-ops on blank, undecodable, disabled, and unconfigured inputs', async () => {
    expect(await tagReferral({ refToken: '', distinctId: 'p' }, { config: config() })).toEqual({
      status: 'skipped',
      reason: 'no ref token',
    })
    expect(
      await tagReferral({ refToken: '!!garbage!!', distinctId: 'p' }, { config: config() })
    ).toEqual({ status: 'skipped', reason: 'undecodable ref token' })
    expect(
      await tagReferral(
        { refToken: encodeRef('label', SECRET), distinctId: 'p' },
        { config: config({ disabled: true }) }
      )
    ).toEqual({ status: 'skipped', reason: 'posthog disabled' })
    expect(
      await tagReferral(
        { refToken: encodeRef('label', SECRET), distinctId: 'p' },
        { config: config({ host: undefined }) }
      )
    ).toEqual({ status: 'skipped', reason: 'posthog host/key not configured' })
    expect(captureMock).not.toHaveBeenCalled()
  })

  it('key rotation changes the token (env-keyed obfuscation)', () => {
    const a = encodeRef('same-label', 'secret-A')
    const b = encodeRef('same-label', 'secret-B')
    expect(a).not.toBe(b)
  })
})
