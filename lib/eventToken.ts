import { createHmac, timingSafeEqual } from 'crypto'

const SECRET_KEY = process.env.GOOGLE_OAUTH_SECRET!

interface EventTokenPayload {
  eventId: string
  email: string
  expiresAt: string
}

export function createEventToken(eventId: string, email: string, eventEndTime: string): string {
  const payload: EventTokenPayload = {
    eventId,
    email,
    expiresAt: eventEndTime,
  }
  const data = JSON.stringify(payload)
  const signature = signPayload(data)
  return Buffer.from(JSON.stringify({ data, signature })).toString('base64url')
}

export function verifyEventToken(
  token: string,
  eventId: string
): { valid: true; payload: EventTokenPayload } | { valid: false; error: string } {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString())
    const { data, signature } = decoded

    if (!data || !signature) {
      return { valid: false, error: 'Malformed token' }
    }

    const expectedSignature = signPayload(data)
    const sigBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valid: false, error: 'Invalid token' }
    }

    const payload: EventTokenPayload = JSON.parse(data)

    if (payload.eventId !== eventId) {
      return { valid: false, error: 'Token does not match event' }
    }

    if (new Date(payload.expiresAt) < new Date()) {
      return { valid: false, error: 'Token expired' }
    }

    return { valid: true, payload }
  } catch {
    return { valid: false, error: 'Invalid token' }
  }
}

export function createEventPageUrl(
  origin: string,
  eventId: string,
  email: string,
  eventEndTime: string
): string {
  const token = createEventToken(eventId, email, eventEndTime)
  return `${origin}/event/${eventId}?token=${token}`
}

function signPayload(data: string): string {
  if (!SECRET_KEY) {
    throw new Error('GOOGLE_OAUTH_SECRET environment variable is required')
  }
  return createHmac('sha256', SECRET_KEY).update(data).digest('hex')
}
