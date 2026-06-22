import { describe, it, expect } from 'vitest'
import { parseZipInput, stateFromZip, ZIP_OR_STATE_ZIP_REGEX } from '../parseZip'

describe('stateFromZip', () => {
  it.each([
    ['90045', 'CA'],
    ['90210', 'CA'],
    ['94110', 'CA'],
    ['10001', 'NY'],
    ['33101', 'FL'],
    ['98101', 'WA'],
    ['00601', 'PR'],
    ['96701', 'HI'],
    ['99501', 'AK'],
    ['02108', 'MA'],
  ])('returns %s → %s', (zip, expected) => {
    expect(stateFromZip(zip)).toBe(expected)
  })

  it('returns null for too-short input', () => {
    expect(stateFromZip('12')).toBeNull()
  })

  it('handles zip+4 by reading just the 5-digit prefix', () => {
    expect(stateFromZip('90045-1234')).toBe('CA')
  })
})

describe('parseZipInput', () => {
  it('parses bare zip and derives state', () => {
    expect(parseZipInput('90045')).toEqual({ state: 'CA', zip: '90045', raw: '90045' })
  })

  it('parses zip+4', () => {
    expect(parseZipInput('90045-1234')).toEqual({
      state: 'CA',
      zip: '90045-1234',
      raw: '90045-1234',
    })
  })

  it('parses "CA 90045" format with explicit state', () => {
    expect(parseZipInput('CA 90045')).toEqual({ state: 'CA', zip: '90045', raw: 'CA 90045' })
  })

  it('uppercases lowercase state codes', () => {
    expect(parseZipInput('ca 90045')).toEqual({ state: 'CA', zip: '90045', raw: 'ca 90045' })
  })

  it('parses state + zip+4', () => {
    expect(parseZipInput('CA 90045-1234')).toEqual({
      state: 'CA',
      zip: '90045-1234',
      raw: 'CA 90045-1234',
    })
  })

  it('trusts the explicit state even when it disagrees with zip-derived state', () => {
    expect(parseZipInput('NY 90045').state).toBe('NY')
  })

  it('returns empty zip and null state on garbage input', () => {
    expect(parseZipInput('not-a-zip')).toEqual({ state: null, zip: '', raw: 'not-a-zip' })
  })

  it('handles surrounding whitespace', () => {
    expect(parseZipInput('  90045  ')).toMatchObject({ state: 'CA', zip: '90045' })
  })
})

describe('ZIP_OR_STATE_ZIP_REGEX', () => {
  it.each([
    '90045',
    '90045-1234',
    'CA 90045',
    'ca 90045',
    'CA 90045-1234',
  ])('accepts %s', (input) => {
    expect(ZIP_OR_STATE_ZIP_REGEX.test(input)).toBe(true)
  })

  it.each([
    '9004',
    'ABC 90045',
    'CA90045',
    '90045 CA',
    'CA  90045 ',
    'CALI 90045',
  ])('rejects %s', (input) => {
    expect(ZIP_OR_STATE_ZIP_REGEX.test(input)).toBe(false)
  })
})
