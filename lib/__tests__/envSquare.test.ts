import { describe, it, expect } from 'vitest'
import { validateSquareConfig } from '../env'

const full = {
  SQUARE_ACCESS_TOKEN: 't',
  SQUARE_LOCATION_ID: 'l',
  SQUARE_WEBHOOK_SIGNATURE_KEY: 'k',
  SQUARE_WEBHOOK_URL: 'https://example.com/hook',
} as unknown as NodeJS.ProcessEnv

describe('validateSquareConfig', () => {
  it('passes when Square is unconfigured', () => {
    expect(validateSquareConfig({} as NodeJS.ProcessEnv)).toEqual([])
  })
  it('passes with a full config', () => {
    expect(validateSquareConfig(full)).toEqual([])
  })
  it('flags a partial config', () => {
    const p = validateSquareConfig({ SQUARE_ACCESS_TOKEN: 't' } as unknown as NodeJS.ProcessEnv)
    expect(p.join()).toContain('SQUARE_LOCATION_ID')
  })
  it('flags a bad environment and url', () => {
    const p = validateSquareConfig({
      ...full,
      SQUARE_ENVIRONMENT: 'prod',
      SQUARE_WEBHOOK_URL: 'nope',
    } as unknown as NodeJS.ProcessEnv)
    expect(p).toHaveLength(2)
  })
})
