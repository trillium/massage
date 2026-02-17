import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubEnv('GOOGLE_OAUTH_SECRET', 'test-secret-key-for-testing')

const { createEventToken, verifyEventToken, createEventPageUrl } = await import('../eventToken')

describe('Event Token System', () => {
  const eventId = 'cal-event-123'
  const email = 'client@example.com'
  const futureDate = new Date(Date.now() + 86400000).toISOString()
  const pastDate = new Date(Date.now() - 86400000).toISOString()

  describe('createEventToken', () => {
    it('returns a base64url string', () => {
      const token = createEventToken(eventId, email, futureDate)
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token).not.toContain('+')
      expect(token).not.toContain('/')
    })
  })

  describe('verifyEventToken', () => {
    it('validates a correctly generated token', () => {
      const token = createEventToken(eventId, email, futureDate)
      const result = verifyEventToken(token, eventId)
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.payload.eventId).toBe(eventId)
        expect(result.payload.email).toBe(email)
        expect(result.payload.expiresAt).toBe(futureDate)
      }
    })

    it('rejects a token for a different event', () => {
      const token = createEventToken(eventId, email, futureDate)
      const result = verifyEventToken(token, 'different-event')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Token does not match event')
      }
    })

    it('rejects an expired token', () => {
      const token = createEventToken(eventId, email, pastDate)
      const result = verifyEventToken(token, eventId)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Token expired')
      }
    })

    it('rejects a tampered token', () => {
      const token = createEventToken(eventId, email, futureDate)
      const tampered = token.slice(0, -5) + 'XXXXX'
      const result = verifyEventToken(tampered, eventId)
      expect(result.valid).toBe(false)
    })

    it('rejects garbage input', () => {
      const result = verifyEventToken('not-a-real-token', eventId)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Invalid token')
      }
    })
  })

  describe('createEventPageUrl', () => {
    it('builds a URL with event id and token', () => {
      const url = createEventPageUrl('https://example.com', eventId, email, futureDate)
      expect(url).toContain(`/event/${eventId}`)
      expect(url).toContain('token=')
      expect(url.startsWith('https://example.com')).toBe(true)
    })
  })
})
