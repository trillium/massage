import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { IncomingMessage } from 'http'
import { handleAppointmentRequest } from '../handleAppointmentRequest'
import { AppointmentRequestType } from '@/lib/types'
import { AppointmentRequestSchema } from '../schema'
import { z } from 'zod'

// Mock Pushover to prevent environment variable errors
vi.mock('../messaging/push/admin/pushover', () => ({
  pushoverSendMessage: vi.fn(() => Promise.resolve()),
}))

// Mock createCalendarAppointment
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

    // Assert: client email receives cancelUrl
    expect(mockClientRequestEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        cancelUrl: expect.stringContaining('/api/decline'),
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
