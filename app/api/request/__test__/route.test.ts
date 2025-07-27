import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleAppointmentRequest } from '../route'
import { AppointmentRequestSchema } from 'lib/schema'

// Mocks
const sendMailMock = vi.fn(() => Promise.resolve())
const approvalEmailMock = vi.fn(() => ({ subject: 'Approval', body: 'Approval body' }))
const clientRequestEmailMock = vi.fn(() => ({ subject: 'Client', body: 'Client body' }))
const getHashMock = vi.fn(() => 'hash')

const validPayload = {
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  start: new Date().toISOString(),
  end: new Date(Date.now() + 3600000).toISOString(),
  timeZone: 'America/New_York',
  location: '123 Main St',
  city: 'New York', // <-- Added city for schema compliance
  zipCode: '10001', // <-- Added zipCode for schema compliance
  duration: '60',
  price: '100',
  phone: '555-1234',
  eventBaseString: 'base',
  paymentMethod: 'cash',
}

function makeRequest(body: any, headers: Record<string, string> = {}) {
  return {
    json: async () => body,
    socket: { remoteAddress: '1.2.3.4' },
  } as any
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
      ownerTimeZone: 'America/New_York',
      approvalEmailFn: approvalEmailMock,
      clientRequestEmailFn: clientRequestEmailMock,
      getHashFn: getHashMock,
      rateLimiter: () => false,
      appointmentRequestSchema: AppointmentRequestSchema,
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
      ownerTimeZone: 'America/New_York',
      approvalEmailFn: approvalEmailMock,
      clientRequestEmailFn: clientRequestEmailMock,
      getHashFn: getHashMock,
      rateLimiter: () => false,
      appointmentRequestSchema: AppointmentRequestSchema,
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
        ownerTimeZone: 'America/New_York',
        approvalEmailFn: approvalEmailMock,
        clientRequestEmailFn: clientRequestEmailMock,
        getHashFn: getHashMock,
        rateLimiter,
        appointmentRequestSchema: AppointmentRequestSchema,
      })
    }
    const res = await handleAppointmentRequest({
      req,
      headers,
      sendMailFn: sendMailMock,
      siteMetadata: { email: 'admin@example.com' },
      ownerTimeZone: 'America/New_York',
      approvalEmailFn: approvalEmailMock,
      clientRequestEmailFn: clientRequestEmailMock,
      getHashFn: getHashMock,
      rateLimiter,
      appointmentRequestSchema: AppointmentRequestSchema,
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
      ownerTimeZone: 'America/New_York',
      approvalEmailFn: approvalEmailMock,
      clientRequestEmailFn: clientRequestEmailMock,
      getHashFn: getHashMock,
      rateLimiter: () => false,
      appointmentRequestSchema: AppointmentRequestSchema,
    })
    expect(sendMailMock).toHaveBeenCalledTimes(2)
  })
})
