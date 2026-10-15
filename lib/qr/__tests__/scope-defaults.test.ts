import { describe, expect, it } from 'vitest'
import { destinationForCode, scopeFromCode, SCOPE_DEFAULTS } from '../scope-defaults'

const HOME = 'https://trilliummassage.la'

describe('SCOPE_DEFAULTS', () => {
  it.each([
    ['BC01', HOME],
    ['BC06', HOME],
    ['BCR01', `${HOME}/overtime`],
    ['AFSR01', `${HOME}/edge-office-hours`],
    ['HB01', `${HOME}/blog/airbnb-host-promo-2026-03`],
    ['HB2', `${HOME}/nerdstage`],
  ])('registers %s', (scope, destination) => {
    expect(SCOPE_DEFAULTS[scope]).toBe(destination)
  })

  it('only registers keys that scopeFromCode can parse', () => {
    for (const scope of Object.keys(SCOPE_DEFAULTS)) {
      expect(scopeFromCode(`${scope}-AAAAAAAA`)).toBe(scope)
    }
  })
})

describe('destinationForCode', () => {
  it('resolves registered scopes', () => {
    expect(destinationForCode('BCR01-0A1B2C3D')).toBe(`${HOME}/overtime`)
    expect(destinationForCode('HB2-A6D8DB95')).toBe(`${HOME}/nerdstage`)
  })

  it('returns null for unregistered or unparseable codes', () => {
    expect(destinationForCode('ZZ99-AAAAAAAA')).toBeNull()
    expect(destinationForCode('BC-E2DED120')).toBeNull()
    expect(destinationForCode('bc01-ab12cd34')).toBeNull()
  })
})
