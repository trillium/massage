import { describe, it, expect } from 'vitest'
import {
  barterTag,
  parseBarterTag,
  buildBarterUrl,
  barterSmsMessage,
  barterSmsHref,
  normalizeShow,
  normalizeClient,
} from '@/lib/ref/barter'
import { decodeRef } from '@/lib/ref/refCodec'

const SECRET = 'unit-secret'

describe('normalizeShow', () => {
  it('lowercases and strips everything but alphanumerics', () => {
    expect(normalizeShow('SCaLE 23x')).toBe('scale23x')
    expect(normalizeShow('open-claw!')).toBe('openclaw')
  })

  it('keeps the full normalized value without truncating', () => {
    expect(normalizeShow('a'.repeat(40))).toHaveLength(40)
  })
})

describe('normalizeClient', () => {
  it('lowercases and converts runs of other characters to single dashes', () => {
    expect(normalizeClient('DJ Beard')).toBe('dj-beard')
    expect(normalizeClient('  reiki / anna  ')).toBe('reiki-anna')
  })

  it('never starts or ends with a dash', () => {
    expect(normalizeClient('-anna-')).toBe('anna')
    expect(normalizeClient(' dj beard ')).toBe('dj-beard')
  })
})

describe('barterTag', () => {
  it('builds b-<show>-<client>', () => {
    expect(barterTag('SCaLE 23x', 'DJ Beard')).toBe('b-scale23x-dj-beard')
  })

  it('is deterministic', () => {
    expect(barterTag('overtime', 'anna')).toBe(barterTag('Overtime', 'Anna'))
  })

  it('throws when show or client normalizes to nothing', () => {
    expect(() => barterTag('  ', 'anna')).toThrow('show is required')
    expect(() => barterTag('overtime', '--')).toThrow('client is required')
  })

  it('rejects show or client longer than 24 characters instead of truncating', () => {
    expect(() => barterTag('a'.repeat(25), 'anna')).toThrow('show is too long (24 characters max)')
    expect(() => barterTag('overtime', 'b'.repeat(25))).toThrow(
      'client is too long (24 characters max)'
    )
    expect(barterTag('a'.repeat(24), 'b'.repeat(24))).toBe(`b-${'a'.repeat(24)}-${'b'.repeat(24)}`)
  })
})

describe('parseBarterTag', () => {
  it('round-trips a minted tag', () => {
    expect(parseBarterTag(barterTag('SCaLE 23x', 'DJ Beard'))).toEqual({
      show: 'scale23x',
      client: 'dj-beard',
    })
  })

  it('keeps dashes in the client segment', () => {
    expect(parseBarterTag('b-overtime-mary-jo')).toEqual({ show: 'overtime', client: 'mary-jo' })
  })

  it('rejects non-barter and malformed tags', () => {
    expect(parseBarterTag('instagram-bio')).toBeNull()
    expect(parseBarterTag('b-onlyshow')).toBeNull()
    expect(parseBarterTag('b--client')).toBeNull()
    expect(parseBarterTag('b-show-')).toBeNull()
  })
})

describe('buildBarterUrl', () => {
  it('points at /barter with a ?ref code that decodes back to the tag', () => {
    const url = new URL(buildBarterUrl('overtime', 'anna', 'https://trilliummassage.la', SECRET))
    expect(url.pathname).toBe('/barter')
    const code = url.searchParams.get('ref')
    expect(code).toBeTruthy()
    expect(decodeRef(code as string, SECRET)).toBe('b-overtime-anna')
  })

  it('tolerates a trailing slash on the base URL', () => {
    const url = new URL(buildBarterUrl('overtime', 'anna', 'https://trilliummassage.la/', SECRET))
    expect(url.pathname).toBe('/barter')
  })

  it('is deterministic per client label', () => {
    const mint = () => buildBarterUrl('overtime', 'anna', 'https://trilliummassage.la', SECRET)
    expect(mint()).toBe(mint())
  })
})

describe('barterSmsHref', () => {
  it('opens a recipient-less composer with the link in the body', () => {
    const href = barterSmsHref('https://trilliummassage.la/barter?ref=Xk93aQ')
    expect(href.startsWith('sms:?&body=')).toBe(true)
    const body = decodeURIComponent(href.slice('sms:?&body='.length))
    expect(body).toBe(barterSmsMessage('https://trilliummassage.la/barter?ref=Xk93aQ'))
    expect(body).toContain('https://trilliummassage.la/barter?ref=Xk93aQ')
  })
})
