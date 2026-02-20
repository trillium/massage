import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { IncomingMessage } from 'http'
import { handleAppointmentRequest } from '../handleAppointmentRequest'
import { AppointmentRequestType } from '@/lib/types'
import { AppointmentRequestSchema } from '../schema'
import { z } from 'zod'
import { pushoverSendMessage } from '../messaging/push/admin/pushover'

vi.mock('../messaging/push/admin/pushover', () => ({
  pushoverSendMessage: vi.fn(() => Promise.resolve()),
}))

vi.mock('../availability/createCalendarAppointment', () => ({
  default: vi.fn(() => Promise.resolve()),
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
    })

    // Assert
    const response = await result.json()
    expect(result.status).toBe(429)
    expect(response.error).toBe('Rate limit exceeded')
    expect(mockSendMail).not.toHaveBeenCalled()
    expect(mockCreateRequestCalendarEvent).not.toHaveBeenCalled()
  })

  describe('instant confirm error handling', () => {
    const instantConfirmData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      start: '2024-01-01T10:00:00Z',
      end: '2024-01-01T11:00:00Z',
      timeZone: 'UTC',
      duration: '60',
      phone: '555-5555',
      eventBaseString: 'base',
      instantConfirm: true,
    }

    const mockCreateCalendarAppointment = async () => {
      const { default: fn } = await import('../availability/createCalendarAppointment')
      return fn as ReturnType<typeof vi.fn>
    }

    it('should return 502 retryable when calendar create throws', async () => {
      mockRateLimiter.mockReturnValue(false)
      vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
        success: true,
        data: instantConfirmData,
      }))
      mockGetHash.mockReturnValue('test-hash')
      const createCalFn = await mockCreateCalendarAppointment()
      createCalFn.mockRejectedValueOnce(new Error('Calendar API down'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

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
      })

      const response = await result.json()
      expect(result.status).toBe(502)
      expect(response.errorType).toBe('retryable')
      expect(mockSendMail).not.toHaveBeenCalled()
    })

    it('should return 200 partial_success when email throws + pushover fallback', async () => {
      mockRateLimiter.mockReturnValue(false)
      vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
        success: true,
        data: instantConfirmData,
      }))
      mockGetHash.mockReturnValue('test-hash')
      const createCalFn = await mockCreateCalendarAppointment()
      createCalFn.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'ic-event-id' }),
      })
      mockClientConfirmEmail.mockResolvedValue({ subject: 'Confirmed', body: 'Confirmed' })
      mockSendMail.mockRejectedValueOnce(new Error('SMTP down'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

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
      })

      const response = await result.json()
      expect(result.status).toBe(200)
      expect(response.errorType).toBe('partial_success')
      expect(response.eventPageUrl).toBeTruthy()
      expect(pushoverSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Email Failed - Instant Confirm',
          priority: 1,
        })
      )
    })
  })

  describe('standard request error handling', () => {
    const standardData = {
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

    it('should return 502 retryable when calendar create throws', async () => {
      mockRateLimiter.mockReturnValue(false)
      vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
        success: true,
        data: standardData,
      }))
      mockCreateRequestCalendarEvent.mockRejectedValueOnce(new Error('Calendar API down'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

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
      })

      const response = await result.json()
      expect(result.status).toBe(502)
      expect(response.errorType).toBe('retryable')
      expect(mockSendMail).not.toHaveBeenCalled()
    })

    it('should still return 200 success when calendar update throws (non-fatal)', async () => {
      mockRateLimiter.mockReturnValue(false)
      vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
        success: true,
        data: standardData,
      }))
      mockGetHash.mockReturnValue('test-hash')
      mockCreateRequestCalendarEvent.mockResolvedValueOnce({ id: 'test-event-id' })
      mockUpdateCalendarEvent.mockRejectedValueOnce(new Error('Calendar patch failed'))
      mockApprovalEmail.mockReturnValue({ subject: 'Test', body: 'Test' })
      mockClientRequestEmail.mockResolvedValue({ subject: 'Test', body: 'Test' })
      vi.spyOn(console, 'error').mockImplementation(() => {})

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
      })

      const response = await result.json()
      expect(result.status).toBe(200)
      expect(response.success).toBe(true)
      expect(mockSendMail).toHaveBeenCalledTimes(2)
    })

    it('should return 200 partial_success when email throws + pushover fallback', async () => {
      mockRateLimiter.mockReturnValue(false)
      vi.spyOn(AppointmentRequestSchema, 'safeParse').mockImplementation(() => ({
        success: true,
        data: standardData,
      }))
      mockGetHash.mockReturnValue('test-hash')
      mockCreateRequestCalendarEvent.mockResolvedValueOnce({ id: 'test-event-id' })
      mockApprovalEmail.mockReturnValue({ subject: 'Test', body: 'Test' })
      mockSendMail.mockRejectedValueOnce(new Error('SMTP down'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

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
      })

      const response = await result.json()
      expect(result.status).toBe(200)
      expect(response.errorType).toBe('partial_success')
      expect(response.eventPageUrl).toBeTruthy()
      expect(pushoverSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Email Failed - Appointment Request',
          priority: 1,
        })
      )
    })
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
    })

    // Assert
    const response = await result.json()
    expect(result.status).toBe(400)
    expect(response).toBe('Validation failed')
    expect(mockSendMail).not.toHaveBeenCalled()
    expect(mockCreateRequestCalendarEvent).not.toHaveBeenCalled()
  })
})
