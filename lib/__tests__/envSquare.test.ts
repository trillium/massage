import { describe, it, expect } from 'vitest'
import { squareConfigError } from '../squareEnv'

const env = (o: Record<string, string>) => o as unknown as NodeJS.ProcessEnv
const full = {
  SQUARE_ACCESS_TOKEN: 't',
  SQUARE_LOCATION_ID: 'l',
  SQUARE_WEBHOOK_SIGNATURE_KEY: 'k',
  SQUARE_WEBHOOK_URL: 'https://example.com/hook',
}

describe('squareConfigError', () => {
  it('passes when Square is unconfigured', () => {
    expect(squareConfigError(env({}))).toBeNull()
  })
  it('passes with a full config', () => {
    expect(squareConfigError(env(full))).toBeNull()
  })
  it('flags a partial config', () => {
    expect(squareConfigError(env({ SQUARE_ACCESS_TOKEN: 't' }))).toContain('SQUARE_LOCATION_ID')
  })
  it('flags a bad environment and url', () => {
    const msg = squareConfigError(
      env({ ...full, SQUARE_ENVIRONMENT: 'prod', SQUARE_WEBHOOK_URL: 'nope' })
    )
    expect(msg).toContain('SQUARE_ENVIRONMENT')
    expect(msg).toContain('not a valid URL')
  })
  it('requires https webhook in production', () => {
    const msg = squareConfigError(
      env({ ...full, SQUARE_ENVIRONMENT: 'production', SQUARE_WEBHOOK_URL: 'http://x.com/h' })
    )
    expect(msg).toContain('https')
  })
})
