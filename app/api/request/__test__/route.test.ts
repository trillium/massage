import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleAppointmentRequest } from 'lib/handleAppointmentRequest'
import { AppointmentRequestSchema } from 'lib/schema'
import type { NextRequest } from 'next/server'
import type { IncomingMessage } from 'http'

// Mock Pushover to prevent environment variable errors
vi.mock('lib/messaging/push/admin/pushover', () => ({
  pushoverSendMessage: vi.fn(() => Promise.resolve()),
}))

// Mocks
const sendMailMock = vi.fn(() => Promise.resolve())
const approvalEmailMock = vi.fn(() => ({ subject: 'Approval', body: 'Approval body' }))
const clientRequestEmailMock = vi.fn(() =>
  Promise.resolve({ subject: 'Client', body: 'Client body' })
)
const getHashMock = vi.fn(() => 'hash')

const validPayload = {
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  start: new Date().toISOString(),
  end: new Date(Date.now() + 3600000).toISOString(),
  timeZone: 'America/Los_Angeles',
  locationObject: {
    street: '123 Main St',
    city: 'New York',
    zip: '10001',
  },
  duration: '60',
  price: '100',
  phone: '555-1234',
  eventBaseString: 'base',
  paymentMethod: 'cash',
}

function makeRequest(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return {
    json: async () => body,
    socket: { remoteAddress: '1.2.3.4' },
  } as unknown as NextRequest & IncomingMessage
}

function makeHeaders(headers: Record<string, string> = {}) {
  return {
    get: (key: string) => headers[key],
  } as Headers
}

describe('handleAppointmentRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('accepts a valid payload', async () => {
    const req = makeRequest(validPayload, { origin: 'http://localhost' })
    const headers = makeHeaders({ origin: 'http://localhost' })
    const res = await handleAppointmentRequest({
      req,
      headers,
      sendMailFn: sendMailMock,
      siteMetadata: { email: 'admin@example.com' },
      ownerTimeZone: 'America/Los_Angeles',
      approvalEmailFn: approvalEmailMock,
      clientRequestEmailFn: clientRequestEmailMock,
      getHashFn: getHashMock,
      rateLimiter: () => false,
      schema: AppointmentRequestSchema,
    })
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('rejects invalid payload', async () => {
    const req = makeRequest({})
    const headers = makeHeaders()
    const res = await handleAppointmentRequest({
      req,
      headers,
      sendMailFn: sendMailMock,
      siteMetadata: { email: 'admin@example.com' },
      ownerTimeZone: 'America/Los_Angeles',
      approvalEmailFn: approvalEmailMock,
      clientRequestEmailFn: clientRequestEmailMock,
      getHashFn: getHashMock,
      rateLimiter: () => false,
      schema: AppointmentRequestSchema,
    })
    expect(res.status).toBe(400)
  })

  it('enforces rate limiting', async () => {
    const req = makeRequest(validPayload)
    const headers = makeHeaders()
    let callCount = 0
    const rateLimiter = () => {
      callCount++
      return callCount > 5
    }
    for (let i = 0; i < 5; i++) {
      await handleAppointmentRequest({
        req,
        headers,
        sendMailFn: sendMailMock,
        siteMetadata: { email: 'admin@example.com' },
        ownerTimeZone: 'America/Los_Angeles',
        approvalEmailFn: approvalEmailMock,
        clientRequestEmailFn: clientRequestEmailMock,
        getHashFn: getHashMock,
        rateLimiter,
        schema: AppointmentRequestSchema,
      })
    }
    const res = await handleAppointmentRequest({
      req,
      headers,
      sendMailFn: sendMailMock,
      siteMetadata: { email: 'admin@example.com' },
      ownerTimeZone: 'America/Los_Angeles',
      approvalEmailFn: approvalEmailMock,
      clientRequestEmailFn: clientRequestEmailMock,
      getHashFn: getHashMock,
      rateLimiter,
      schema: AppointmentRequestSchema,
    })
    expect(res.status).toBe(429)
  })

  it('calls sendMail for approval and confirmation', async () => {
    const req = makeRequest(validPayload, { origin: 'http://localhost' })
    const headers = makeHeaders({ origin: 'http://localhost' })
    await handleAppointmentRequest({
      req,
      headers,
      sendMailFn: sendMailMock,
      siteMetadata: { email: 'admin@example.com' },
      ownerTimeZone: 'America/Los_Angeles',
      approvalEmailFn: approvalEmailMock,
      clientRequestEmailFn: clientRequestEmailMock,
      getHashFn: getHashMock,
      rateLimiter: () => false,
      schema: AppointmentRequestSchema,
    })
    expect(sendMailMock).toHaveBeenCalledTimes(2)
  })
})
