import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleAppointmentRequest } from 'lib/handleAppointmentRequest'
import { AppointmentRequestSchema } from 'lib/schema'
import type { NextRequest } from 'next/server'
import type { IncomingMessage } from 'http'

vi.mock('lib/messaging/push/admin/pushover', () => ({
  pushoverSendMessage: vi.fn(() => Promise.resolve()),
}))

vi.mock('lib/availability/createCalendarAppointment', () => ({
  default: vi.fn(() => Promise.resolve({ ok: true, json: () => ({ id: 'instant-cal-id' }) })),
}))

vi.mock('lib/holds/releaseSlotHold', () => ({
  releaseSlotHold: vi.fn(() => Promise.resolve()),
}))

vi.mock('lib/eventToken', () => ({
  verifyEventToken: vi.fn(() => ({ valid: true, payload: {} })),
  createEventPageUrl: vi.fn((origin, eventId) => `${origin}/event/${eventId}?token=mock-token`),
}))

const { verifyEventToken } = await import('lib/eventToken')
const { releaseSlotHold } = await import('lib/holds/releaseSlotHold')
const createCalendarAppointment = (await import('lib/availability/createCalendarAppointment'))
  .default

const sendMailMock = vi.fn(() => Promise.resolve())
const approvalEmailMock = vi.fn(() => ({ subject: 'Approval', body: 'Approval body' }))
const clientRequestEmailMock = vi.fn(
  () => ({ subject: 'Client', body: 'Client body' }) as { subject: string; body: string }
)
const clientConfirmEmailMock = vi.fn(
  () => ({ subject: 'Confirmed', body: 'Confirmed body' }) as { subject: string; body: string }
)
const getHashMock = vi.fn(() => 'hash')
const createRequestCalendarEventMock = vi.fn(() => Promise.resolve({ id: 'test-event-id' }))
const updateCalendarEventMock = vi.fn(() => Promise.resolve({}))
const checkSlotAvailabilityMock = vi.fn(async () => ({ available: true }))
const reserveAppointmentSlotMock = vi.fn(async () => ({
  success: true as const,
  appointmentId: 'test-apt',
}))
const linkAppointmentToCalendarEventMock = vi.fn(async () => {})

const validPayload = {
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  start: new Date().toISOString(),
  end: new Date(Date.now() + 3600000).toISOString(),
  timeZone: 'America/Los_Angeles',
  locationObject: { street: '123 Main St', city: 'New York', zip: '10001' },
  duration: '60',
  price: '100',
  phone: '555-1234',
  eventBaseString: 'base',
  paymentMethod: 'cash',
}

function makeRequest(body: Record<string, unknown>) {
  return {
    json: async () => body,
    socket: { remoteAddress: '1.2.3.4' },
  } as unknown as NextRequest & IncomingMessage
}

function makeHeaders(headers: Record<string, string> = {}) {
  return { get: (key: string) => headers[key] } as Headers
}

function callHandler(overrides: Record<string, unknown> = {}) {
  const payload = { ...validPayload, ...overrides }
  return handleAppointmentRequest({
    req: makeRequest(payload),
    headers: makeHeaders({ origin: 'http://localhost' }),
    sendMailFn: sendMailMock,
    siteMetadata: { email: 'admin@example.com' },
    ownerTimeZone: 'America/Los_Angeles',
    approvalEmailFn: approvalEmailMock,
    clientRequestEmailFn: clientRequestEmailMock,
    clientConfirmEmailFn: clientConfirmEmailMock,
    getHashFn: getHashMock,
    rateLimiter: () => false,
    schema: AppointmentRequestSchema,
    createRequestCalendarEvent: createRequestCalendarEventMock,
    updateCalendarEvent: updateCalendarEventMock,
    checkSlotAvailability: checkSlotAvailabilityMock,
    reserveAppointmentSlot: reserveAppointmentSlotMock,
    linkAppointmentToCalendarEvent: linkAppointmentToCalendarEventMock,
  })
}

describe('handleAppointmentRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkSlotAvailabilityMock.mockResolvedValue({ available: true })
    reserveAppointmentSlotMock.mockResolvedValue({
      success: true as const,
      appointmentId: 'test-apt',
    })
    ;(createCalendarAppointment as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => ({ id: 'instant-cal-id' }),
    })
    ;(verifyEventToken as ReturnType<typeof vi.fn>).mockReturnValue({
      valid: true,
      payload: {},
    })
  })

  // ── Validation & Rate Limiting ──────────────────────────────

  it('accepts a valid payload and returns 200', async () => {
    const res = await callHandler()
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('rejects invalid payload with 400', async () => {
    const res = await handleAppointmentRequest({
      req: makeRequest({}),
      headers: makeHeaders(),
      sendMailFn: sendMailMock,
      siteMetadata: { email: 'admin@example.com' },
      ownerTimeZone: 'America/Los_Angeles',
      approvalEmailFn: approvalEmailMock,
      clientRequestEmailFn: clientRequestEmailMock,
      clientConfirmEmailFn: clientConfirmEmailMock,
      getHashFn: getHashMock,
      rateLimiter: () => false,
      schema: AppointmentRequestSchema,
      createRequestCalendarEvent: createRequestCalendarEventMock,
      updateCalendarEvent: updateCalendarEventMock,
      checkSlotAvailability: checkSlotAvailabilityMock,
      reserveAppointmentSlot: reserveAppointmentSlotMock,
      linkAppointmentToCalendarEvent: linkAppointmentToCalendarEventMock,
    })
    expect(res.status).toBe(400)
  })

  it('enforces rate limiting with 429', async () => {
    let callCount = 0
    const res = await handleAppointmentRequest({
      req: makeRequest(validPayload),
      headers: makeHeaders({ origin: 'http://localhost' }),
      sendMailFn: sendMailMock,
      siteMetadata: { email: 'admin@example.com' },
      ownerTimeZone: 'America/Los_Angeles',
      approvalEmailFn: approvalEmailMock,
      clientRequestEmailFn: clientRequestEmailMock,
      clientConfirmEmailFn: clientConfirmEmailMock,
      getHashFn: getHashMock,
      rateLimiter: () => {
        callCount++
        return true
      },
      schema: AppointmentRequestSchema,
      createRequestCalendarEvent: createRequestCalendarEventMock,
      updateCalendarEvent: updateCalendarEventMock,
      checkSlotAvailability: checkSlotAvailabilityMock,
      reserveAppointmentSlot: reserveAppointmentSlotMock,
      linkAppointmentToCalendarEvent: linkAppointmentToCalendarEventMock,
    })
    expect(res.status).toBe(429)
  })

  // ── Slot Availability ───────────────────────────────────────

  it('returns 409 when slot is unavailable', async () => {
    checkSlotAvailabilityMock.mockResolvedValue({ available: false })
    const res = await callHandler({ bookingUrl: '/book' })
    const json = await res.json()
    expect(res.status).toBe(409)
    expect(json.error).toBe('slot_unavailable')
    expect(json.bookingUrl).toBe('/book')
  })

  it('returns 503 when availability check throws', async () => {
    checkSlotAvailabilityMock.mockRejectedValue(new Error('Google API down'))
    const res = await callHandler()
    const json = await res.json()
    expect(res.status).toBe(503)
    expect(json.error).toBe('Unable to verify availability')
  })

  it('skips availability check for reschedule requests', async () => {
    checkSlotAvailabilityMock.mockResolvedValue({ available: false })
    const res = await callHandler({
      rescheduleEventId: 'evt-123',
      rescheduleToken: 'mock-token',
    })
    expect(res.status).toBe(200)
    expect(checkSlotAvailabilityMock).not.toHaveBeenCalled()
  })

  it('passes sessionId and blockingScope to slot availability check', async () => {
    await callHandler({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      slugConfiguration: { blockingScope: 'calendar' },
    })
    expect(checkSlotAvailabilityMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        blockingScope: 'calendar',
      })
    )
  })

  // ── Standard Approval Workflow ──────────────────────────────

  describe('standard approval workflow', () => {
    it('reserves appointment slot with pending status', async () => {
      await callHandler()
      expect(reserveAppointmentSlotMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
          clientEmail: 'alice@example.com',
          clientFirstName: 'Alice',
          clientLastName: 'Smith',
          durationMinutes: 60,
          instantConfirm: false,
        })
      )
    })

    it('returns 409 when reservation fails', async () => {
      reserveAppointmentSlotMock.mockResolvedValue({ success: false as const })
      const res = await callHandler()
      expect(res.status).toBe(409)
    })

    it('creates request calendar event then patches with description', async () => {
      await callHandler()
      expect(createRequestCalendarEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          start: validPayload.start,
          end: validPayload.end,
          description: 'Pending — links loading...',
        })
      )
      expect(updateCalendarEventMock).toHaveBeenCalledWith(
        'test-event-id',
        expect.objectContaining({ description: expect.any(String) })
      )
    })

    it('links appointment to calendar event', async () => {
      await callHandler()
      expect(linkAppointmentToCalendarEventMock).toHaveBeenCalledWith('test-apt', 'test-event-id')
    })

    it('sends admin approval email and client request email', async () => {
      await callHandler()
      expect(sendMailMock).toHaveBeenCalledTimes(2)
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'admin@example.com', subject: 'Approval' })
      )
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'alice@example.com', subject: 'Client' })
      )
    })

    it('returns 502 when email send fails after calendar event created', async () => {
      sendMailMock.mockRejectedValueOnce(new Error('SMTP down'))
      const res = await callHandler()
      const json = await res.json()
      expect(res.status).toBe(502)
      expect(json.error).toContain('email notification failed')
      expect(json.calendarEventId).toBe('test-event-id')
    })

    it('releases slot hold when sessionId is provided', async () => {
      await callHandler({ sessionId: '550e8400-e29b-41d4-a716-446655440000' })
      expect(releaseSlotHold).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000')
    })

    it('does not release slot hold when no sessionId', async () => {
      await callHandler()
      expect(releaseSlotHold).not.toHaveBeenCalled()
    })
  })

  // ── Instant Confirm Workflow ────────────────────────────────

  describe('instant confirm workflow', () => {
    it('returns 200 with instantConfirm flag', async () => {
      const res = await callHandler({ instantConfirm: true })
      const json = await res.json()
      expect(res.status).toBe(200)
      expect(json.instantConfirm).toBe(true)
      expect(json.eventPageUrl).toContain('/event/')
    })

    it('reserves with confirmed status', async () => {
      await callHandler({ instantConfirm: true })
      expect(reserveAppointmentSlotMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'confirmed',
          instantConfirm: true,
          confirmedAt: expect.any(String),
        })
      )
    })

    it('returns 409 when reservation fails', async () => {
      reserveAppointmentSlotMock.mockResolvedValue({ success: false as const })
      const res = await callHandler({ instantConfirm: true })
      expect(res.status).toBe(409)
    })

    it('creates calendar appointment directly (not request event)', async () => {
      await callHandler({ instantConfirm: true })
      expect(createCalendarAppointment).toHaveBeenCalled()
      expect(createRequestCalendarEventMock).not.toHaveBeenCalled()
    })

    it('returns 502 when calendar appointment creation fails', async () => {
      ;(createCalendarAppointment as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      })
      const res = await callHandler({ instantConfirm: true })
      const json = await res.json()
      expect(res.status).toBe(502)
      expect(json.error).toBe('Failed to create calendar appointment')
    })

    it('sends only confirmation email (not approval)', async () => {
      await callHandler({ instantConfirm: true })
      expect(sendMailMock).toHaveBeenCalledTimes(1)
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'alice@example.com', subject: 'Confirmed' })
      )
    })

    it('links appointment and releases hold', async () => {
      await callHandler({
        instantConfirm: true,
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(linkAppointmentToCalendarEventMock).toHaveBeenCalledWith('test-apt', 'instant-cal-id')
      expect(releaseSlotHold).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000')
    })
  })

  // ── Reschedule Workflow ─────────────────────────────────────

  describe('reschedule workflow', () => {
    const reschedulePayload = {
      rescheduleEventId: 'evt-123',
      rescheduleToken: 'mock-token',
    }

    it('returns 200 on successful reschedule', async () => {
      const res = await callHandler(reschedulePayload)
      const json = await res.json()
      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.eventPageUrl).toContain('/event/')
    })

    it('verifies the reschedule token', async () => {
      await callHandler(reschedulePayload)
      expect(verifyEventToken).toHaveBeenCalledWith('mock-token', 'evt-123')
    })

    it('returns 403 when token is invalid', async () => {
      ;(verifyEventToken as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: false,
        error: 'Token expired',
      })
      const res = await callHandler(reschedulePayload)
      const json = await res.json()
      expect(res.status).toBe(403)
      expect(json.error).toBe('Token expired')
    })

    it('updates calendar event with new times', async () => {
      await callHandler(reschedulePayload)
      expect(updateCalendarEventMock).toHaveBeenCalledWith('evt-123', {
        start: { dateTime: validPayload.start, timeZone: validPayload.timeZone },
        end: { dateTime: validPayload.end, timeZone: validPayload.timeZone },
      })
    })

    it('returns 500 when calendar update fails', async () => {
      updateCalendarEventMock.mockRejectedValueOnce(new Error('Calendar API error'))
      const res = await callHandler(reschedulePayload)
      const json = await res.json()
      expect(res.status).toBe(500)
      expect(json.error).toBe('Failed to reschedule appointment')
    })

    it('does not reserve a new appointment slot', async () => {
      await callHandler(reschedulePayload)
      expect(reserveAppointmentSlotMock).not.toHaveBeenCalled()
    })

    it('does not send emails', async () => {
      await callHandler(reschedulePayload)
      expect(sendMailMock).not.toHaveBeenCalled()
    })
  })

  // ── Input Sanitization ──────────────────────────────────────

  describe('HTML escaping', () => {
    it('escapes user input in email template data', async () => {
      await callHandler({
        firstName: '<script>alert("xss")</script>',
        lastName: "O'Malley & Co",
      })
      expect(approvalEmailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
          lastName: 'O&#39;Malley &amp; Co',
        })
      )
    })

    it('escapes location in email data', async () => {
      await callHandler({
        locationObject: { street: '<b>Injected</b>', city: 'Test', zip: '10001' },
      })
      expect(approvalEmailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          location: expect.stringContaining('&lt;b&gt;'),
        })
      )
    })
  })
})
