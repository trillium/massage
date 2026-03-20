import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { IncomingMessage } from 'node:http'
import { handleAppointmentRequest } from '../handleAppointmentRequest'
import { AppointmentRequestType } from '@/lib/types'
import { AppointmentRequestSchema } from '../schema'
import { z } from 'zod'

// Mock Pushover to prevent environment variable errors
vi.mock('../messaging/push/admin/pushover', () => ({
  pushoverSendMessage: vi.fn(() => Promise.resolve()),
}))

// Mock createCalendarAppointment
const mockCreateCalendarAppointment = vi.fn()
vi.mock('../availability/createCalendarAppointment', () => ({
  default: (props: unknown) => mockCreateCalendarAppointment(props),
}))

// Mock eventSummary
vi.mock('../messaging/templates/events/eventSummary', () => ({
  default: vi.fn(() => 'Test Appointment'),
}))

// Mock requestEventSummary
vi.mock('../messaging/templates/events/requestEventSummary', () => ({
  default: vi.fn(() => 'REQUEST: Test Appointment'),
}))

// Mock requestEventDescription
vi.mock('../messaging/templates/events/requestEventDescription', () => ({
  default: vi.fn(() => 'Request event description'),
}))

// Mock dependencies
const mockSendMail = vi.fn()
const mockApprovalEmail = vi.fn()
const mockClientRequestEmail = vi.fn()
const mockClientConfirmEmail = vi.fn()
const mockGetHash = vi.fn()
const mockRateLimiter = vi.fn()
const mockCreateRequestCalendarEvent = vi.fn()
const mockUpdateCalendarEvent = vi.fn()
const mockCheckSlotAvailability = vi.fn()
const mockReserveAppointmentSlot = vi.fn()
const mockLinkAppointmentToCalendarEvent = vi.fn()
type MockAppointmentRequestSchema = { safeParse: ReturnType<typeof vi.fn> }
const mockAppointmentRequestSchema: MockAppointmentRequestSchema = {
  safeParse: vi.fn(),
}

describe('handleAppointmentRequest', () => {
  let mockReq: NextRequest & IncomingMessage
  let mockHeaders: Headers

  beforeEach(() => {
    vi.clearAllMocks()

    mockReq = {
      json: vi.fn().mockResolvedValue({
        start: '2024-01-01T10:00:00Z',
        end: '2024-01-01T11:00:00Z',
        email: 'test@example.com',
        timeZone: 'UTC',
      }),
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as NextRequest & IncomingMessage

    mockHeaders = new Headers({
      origin: 'https://example.com',
    })

    mockCreateRequestCalendarEvent.mockResolvedValue({ id: 'test-event-id' })
    mockUpdateCalendarEvent.mockResolvedValue({})
    mockCheckSlotAvailability.mockResolvedValue({ available: true })
    mockReserveAppointmentSlot.mockResolvedValue({ success: true, appointmentId: 'test-apt-id' })
    mockLinkAppointmentToCalendarEvent.mockResolvedValue(undefined)
    mockCreateCalendarAppointment.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'instant-event-id' }),
    })
  })

  it('should handle successful appointment request', async () => {
    // Arrange
    mockRateLimiter.mockReturnValue(false)
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      start: '2024-01-01T10:00:00Z',
      end: '2024-01-01T11:00:00Z',
      timeZone: 'UTC',
      location: {
        street: '123 Main St',
        city: 'New York',
        zip: '10001',
      },
      duration: '60',
      phone: '555-5555',
      eventBaseString: 'base',
      eventMemberString: undefined,
      eventContainerString: undefined,
      instantConfirm: undefined,
      price: undefined,
      paymentMethod: undefined,
    }
    vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
      success: true,
      data: validData,
    }))
    mockGetHash.mockReturnValue('test-hash')
    mockApprovalEmail.mockReturnValue({
      subject: 'Approval Required',
      body: 'Please approve this appointment',
    })
    mockClientRequestEmail.mockResolvedValue({
      subject: 'Request Received',
      body: 'Your request has been received',
    })

    // Act
    const result = await handleAppointmentRequest({
      req: mockReq,
      headers: mockHeaders,
      sendMailFn: mockSendMail,
      siteMetadata: { email: 'owner@example.com' },
      ownerTimeZone: 'UTC',
      approvalEmailFn: mockApprovalEmail,
      clientRequestEmailFn: mockClientRequestEmail,
      clientConfirmEmailFn: mockClientConfirmEmail,
      getHashFn: mockGetHash,
      rateLimiter: mockRateLimiter,
      schema: AppointmentRequestSchema,
      createRequestCalendarEvent: mockCreateRequestCalendarEvent,
      updateCalendarEvent: mockUpdateCalendarEvent,
      checkSlotAvailability: mockCheckSlotAvailability,
      reserveAppointmentSlot: mockReserveAppointmentSlot,
      linkAppointmentToCalendarEvent: mockLinkAppointmentToCalendarEvent,
    })

    // Assert
    expect(result).toBeInstanceOf(NextResponse)
    expect(mockCreateRequestCalendarEvent).toHaveBeenCalledTimes(1)
    expect(mockUpdateCalendarEvent).toHaveBeenCalledTimes(1)
    expect(mockSendMail).toHaveBeenCalledTimes(2)
    expect(mockApprovalEmail).toHaveBeenCalled()
    expect(mockClientRequestEmail).toHaveBeenCalled()
  })

  it('should create REQUEST calendar event before sending notifications', async () => {
    // Arrange
    mockRateLimiter.mockReturnValue(false)
    const validData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      start: '2024-01-01T10:00:00Z',
      end: '2024-01-01T11:00:00Z',
      timeZone: 'UTC',
      duration: '60',
      phone: '555-1234',
      eventBaseString: 'base',
    }
    vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
      success: true,
      data: validData,
    }))
    mockGetHash.mockReturnValue('test-hash')
    mockApprovalEmail.mockReturnValue({ subject: 'Test', body: 'Test' })
    mockClientRequestEmail.mockResolvedValue({ subject: 'Test', body: 'Test' })

    // Act
    await handleAppointmentRequest({
      req: mockReq,
      headers: mockHeaders,
      sendMailFn: mockSendMail,
      siteMetadata: { email: 'owner@example.com' },
      ownerTimeZone: 'UTC',
      approvalEmailFn: mockApprovalEmail,
      clientRequestEmailFn: mockClientRequestEmail,
      clientConfirmEmailFn: mockClientConfirmEmail,
      getHashFn: mockGetHash,
      rateLimiter: mockRateLimiter,
      schema: AppointmentRequestSchema,
      createRequestCalendarEvent: mockCreateRequestCalendarEvent,
      updateCalendarEvent: mockUpdateCalendarEvent,
      checkSlotAvailability: mockCheckSlotAvailability,
      reserveAppointmentSlot: mockReserveAppointmentSlot,
      linkAppointmentToCalendarEvent: mockLinkAppointmentToCalendarEvent,
    })

    // Assert: calendar event created with REQUEST prefix, no attendees
    expect(mockCreateRequestCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: 'REQUEST: Test Appointment',
        description: 'Pending — links loading...',
      })
    )

    // Assert: event description patched with real links after creation
    expect(mockUpdateCalendarEvent).toHaveBeenCalledWith('test-event-id', expect.any(Object))

    // Assert: approval email receives declineUrl
    expect(mockApprovalEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        declineUrl: expect.stringContaining('/api/decline'),
      })
    )

    // Assert: client email receives eventPageUrl
    expect(mockClientRequestEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        eventPageUrl: expect.stringContaining('/event/test-event-id'),
      })
    )
  })

  it('should return 429 when rate limit is exceeded', async () => {
    // Arrange
    mockRateLimiter.mockReturnValue(true)

    // Act
    const result = await handleAppointmentRequest({
      req: mockReq,
      headers: mockHeaders,
      sendMailFn: mockSendMail,
      siteMetadata: { email: 'owner@example.com' },
      ownerTimeZone: 'UTC',
      approvalEmailFn: mockApprovalEmail,
      clientRequestEmailFn: mockClientRequestEmail,
      clientConfirmEmailFn: mockClientConfirmEmail,
      getHashFn: mockGetHash,
      rateLimiter: mockRateLimiter,
      schema: AppointmentRequestSchema,
      createRequestCalendarEvent: mockCreateRequestCalendarEvent,
      updateCalendarEvent: mockUpdateCalendarEvent,
      checkSlotAvailability: mockCheckSlotAvailability,
      reserveAppointmentSlot: mockReserveAppointmentSlot,
      linkAppointmentToCalendarEvent: mockLinkAppointmentToCalendarEvent,
    })

    // Assert
    const response = await result.json()
    expect(result.status).toBe(429)
    expect(response.error).toBe('Rate limit exceeded')
    expect(mockSendMail).not.toHaveBeenCalled()
    expect(mockCreateRequestCalendarEvent).not.toHaveBeenCalled()
  })

  it('should return 400 when validation fails', async () => {
    // Arrange
    mockRateLimiter.mockReturnValue(false)
    const error = new z.ZodError([
      { code: 'custom', message: 'Validation failed', path: [], input: undefined },
    ])
    Object.assign(error, { message: 'Validation failed' })
    vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
      success: false,
      error: error as z.ZodError<AppointmentRequestType>,
    }))

    // Act
    const result = await handleAppointmentRequest({
      req: mockReq,
      headers: mockHeaders,
      sendMailFn: mockSendMail,
      siteMetadata: { email: 'owner@example.com' },
      ownerTimeZone: 'UTC',
      approvalEmailFn: mockApprovalEmail,
      clientRequestEmailFn: mockClientRequestEmail,
      clientConfirmEmailFn: mockClientConfirmEmail,
      getHashFn: mockGetHash,
      rateLimiter: mockRateLimiter,
      schema: AppointmentRequestSchema,
      createRequestCalendarEvent: mockCreateRequestCalendarEvent,
      updateCalendarEvent: mockUpdateCalendarEvent,
      checkSlotAvailability: mockCheckSlotAvailability,
      reserveAppointmentSlot: mockReserveAppointmentSlot,
      linkAppointmentToCalendarEvent: mockLinkAppointmentToCalendarEvent,
    })

    // Assert
    const response = await result.json()
    expect(result.status).toBe(400)
    expect(response).toBe('Validation failed')
    expect(mockSendMail).not.toHaveBeenCalled()
    expect(mockCreateRequestCalendarEvent).not.toHaveBeenCalled()
  })

  describe('slot availability check (409)', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      start: '2024-01-01T10:00:00Z',
      end: '2024-01-01T11:00:00Z',
      timeZone: 'UTC',
      duration: '60',
      phone: '555-5555',
      eventBaseString: 'base',
      bookingUrl: '/book/test',
    }

    beforeEach(() => {
      mockRateLimiter.mockReturnValue(false)
      vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
        success: true,
        data: validData,
      }))
      mockGetHash.mockReturnValue('test-hash')
      mockApprovalEmail.mockReturnValue({ subject: 'Test', body: 'Test' })
      mockClientRequestEmail.mockResolvedValue({ subject: 'Test', body: 'Test' })
    })

    it('returns 409 when slot is unavailable', async () => {
      mockCheckSlotAvailability.mockResolvedValue({ available: false })

      const result = await handleAppointmentRequest({
        req: mockReq,
        headers: mockHeaders,
        sendMailFn: mockSendMail,
        siteMetadata: { email: 'owner@example.com' },
        ownerTimeZone: 'UTC',
        approvalEmailFn: mockApprovalEmail,
        clientRequestEmailFn: mockClientRequestEmail,
        clientConfirmEmailFn: mockClientConfirmEmail,
        getHashFn: mockGetHash,
        rateLimiter: mockRateLimiter,
        schema: AppointmentRequestSchema,
        createRequestCalendarEvent: mockCreateRequestCalendarEvent,
        updateCalendarEvent: mockUpdateCalendarEvent,
        checkSlotAvailability: mockCheckSlotAvailability,
        reserveAppointmentSlot: mockReserveAppointmentSlot,
        linkAppointmentToCalendarEvent: mockLinkAppointmentToCalendarEvent,
      })

      const response = await result.json()
      expect(result.status).toBe(409)
      expect(response.error).toBe('slot_unavailable')
      expect(response.bookingUrl).toBe('/book/test')
    })

    it('does not create calendar events when slot unavailable', async () => {
      mockCheckSlotAvailability.mockResolvedValue({ available: false })

      await handleAppointmentRequest({
        req: mockReq,
        headers: mockHeaders,
        sendMailFn: mockSendMail,
        siteMetadata: { email: 'owner@example.com' },
        ownerTimeZone: 'UTC',
        approvalEmailFn: mockApprovalEmail,
        clientRequestEmailFn: mockClientRequestEmail,
        clientConfirmEmailFn: mockClientConfirmEmail,
        getHashFn: mockGetHash,
        rateLimiter: mockRateLimiter,
        schema: AppointmentRequestSchema,
        createRequestCalendarEvent: mockCreateRequestCalendarEvent,
        updateCalendarEvent: mockUpdateCalendarEvent,
        checkSlotAvailability: mockCheckSlotAvailability,
        reserveAppointmentSlot: mockReserveAppointmentSlot,
        linkAppointmentToCalendarEvent: mockLinkAppointmentToCalendarEvent,
      })

      expect(mockCreateRequestCalendarEvent).not.toHaveBeenCalled()
      expect(mockUpdateCalendarEvent).not.toHaveBeenCalled()
      expect(mockSendMail).not.toHaveBeenCalled()
    })

    it('does not create instant-confirm calendar event when slot unavailable', async () => {
      mockCheckSlotAvailability.mockResolvedValue({ available: false })
      vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
        success: true,
        data: { ...validData, instantConfirm: true },
      }))

      const result = await handleAppointmentRequest({
        req: mockReq,
        headers: mockHeaders,
        sendMailFn: mockSendMail,
        siteMetadata: { email: 'owner@example.com' },
        ownerTimeZone: 'UTC',
        approvalEmailFn: mockApprovalEmail,
        clientRequestEmailFn: mockClientRequestEmail,
        clientConfirmEmailFn: mockClientConfirmEmail,
        getHashFn: mockGetHash,
        rateLimiter: mockRateLimiter,
        schema: AppointmentRequestSchema,
        createRequestCalendarEvent: mockCreateRequestCalendarEvent,
        updateCalendarEvent: mockUpdateCalendarEvent,
        checkSlotAvailability: mockCheckSlotAvailability,
        reserveAppointmentSlot: mockReserveAppointmentSlot,
        linkAppointmentToCalendarEvent: mockLinkAppointmentToCalendarEvent,
      })

      expect(result.status).toBe(409)
      expect(mockCreateRequestCalendarEvent).not.toHaveBeenCalled()
    })

    it('proceeds normally when slot is available', async () => {
      mockCheckSlotAvailability.mockResolvedValue({ available: true })

      const result = await handleAppointmentRequest({
        req: mockReq,
        headers: mockHeaders,
        sendMailFn: mockSendMail,
        siteMetadata: { email: 'owner@example.com' },
        ownerTimeZone: 'UTC',
        approvalEmailFn: mockApprovalEmail,
        clientRequestEmailFn: mockClientRequestEmail,
        clientConfirmEmailFn: mockClientConfirmEmail,
        getHashFn: mockGetHash,
        rateLimiter: mockRateLimiter,
        schema: AppointmentRequestSchema,
        createRequestCalendarEvent: mockCreateRequestCalendarEvent,
        updateCalendarEvent: mockUpdateCalendarEvent,
        checkSlotAvailability: mockCheckSlotAvailability,
        reserveAppointmentSlot: mockReserveAppointmentSlot,
        linkAppointmentToCalendarEvent: mockLinkAppointmentToCalendarEvent,
      })

      expect(result.status).toBe(200)
      expect(mockCreateRequestCalendarEvent).toHaveBeenCalled()
    })

    it('passes eventMemberString to createCalendarAppointment on instant confirm', async () => {
      mockCheckSlotAvailability.mockResolvedValue({ available: true })
      const instantData = {
        ...validData,
        instantConfirm: true,
        eventMemberString: 'scale23x__EVENT__MEMBER__',
        locationString: 'Test Location',
      }
      vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
        success: true,
        data: instantData,
      }))
      mockClientConfirmEmail.mockResolvedValue({ subject: 'Test', body: 'Test' })

      await handleAppointmentRequest({
        req: mockReq,
        headers: mockHeaders,
        sendMailFn: mockSendMail,
        siteMetadata: { email: 'owner@example.com' },
        ownerTimeZone: 'UTC',
        approvalEmailFn: mockApprovalEmail,
        clientRequestEmailFn: mockClientRequestEmail,
        clientConfirmEmailFn: mockClientConfirmEmail,
        getHashFn: mockGetHash,
        rateLimiter: mockRateLimiter,
        schema: AppointmentRequestSchema,
        createRequestCalendarEvent: mockCreateRequestCalendarEvent,
        updateCalendarEvent: mockUpdateCalendarEvent,
        checkSlotAvailability: mockCheckSlotAvailability,
        reserveAppointmentSlot: mockReserveAppointmentSlot,
        linkAppointmentToCalendarEvent: mockLinkAppointmentToCalendarEvent,
      })

      expect(mockCreateCalendarAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          eventMemberString: 'scale23x__EVENT__MEMBER__',
        })
      )
    })

    it('rejects booking if checkSlotAvailability throws (fail-closed)', async () => {
      mockCheckSlotAvailability.mockRejectedValue(new Error('check failed'))

      const result = await handleAppointmentRequest({
        req: mockReq,
        headers: mockHeaders,
        sendMailFn: mockSendMail,
        siteMetadata: { email: 'owner@example.com' },
        ownerTimeZone: 'UTC',
        approvalEmailFn: mockApprovalEmail,
        clientRequestEmailFn: mockClientRequestEmail,
        clientConfirmEmailFn: mockClientConfirmEmail,
        getHashFn: mockGetHash,
        rateLimiter: mockRateLimiter,
        schema: AppointmentRequestSchema,
        createRequestCalendarEvent: mockCreateRequestCalendarEvent,
        updateCalendarEvent: mockUpdateCalendarEvent,
        checkSlotAvailability: mockCheckSlotAvailability,
        reserveAppointmentSlot: mockReserveAppointmentSlot,
        linkAppointmentToCalendarEvent: mockLinkAppointmentToCalendarEvent,
      })

      expect(result.status).toBe(503)
      expect(mockCreateRequestCalendarEvent).not.toHaveBeenCalled()
    })
  })
})
