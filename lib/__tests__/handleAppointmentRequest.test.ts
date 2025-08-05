import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { IncomingMessage } from 'http'
import { handleAppointmentRequest } from '../handleAppointmentRequest'
import { AppointmentRequestSchema } from '../schema'
import { z } from 'zod'

// Mock Pushover to prevent environment variable errors
vi.mock('../pushover/pushover', () => ({
  pushoverSendMesage: vi.fn(() => Promise.resolve()),
}))

// Mock dependencies
const mockSendMail = vi.fn()
const mockApprovalEmail = vi.fn()
const mockClientRequestEmail = vi.fn()
const mockGetHash = vi.fn()
const mockRateLimiter = vi.fn()
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
      location: 'Office',
      city: 'New York',
      zipCode: '10001',
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
    mockClientRequestEmail.mockReturnValue({
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
      getHashFn: mockGetHash,
      rateLimiter: mockRateLimiter,
      schema: AppointmentRequestSchema,
    })

    // Assert
    expect(result).toBeInstanceOf(NextResponse)
    expect(mockSendMail).toHaveBeenCalledTimes(2)
    expect(mockApprovalEmail).toHaveBeenCalled()
    expect(mockClientRequestEmail).toHaveBeenCalled()
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
      getHashFn: mockGetHash,
      rateLimiter: mockRateLimiter,
      schema: AppointmentRequestSchema,
    })

    // Assert
    const response = await result.json()
    expect(result.status).toBe(429)
    expect(response.error).toBe('Rate limit exceeded')
    expect(mockSendMail).not.toHaveBeenCalled()
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
      error: error as z.ZodError<import('../schema').AppointmentRequestType>,
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
      getHashFn: mockGetHash,
      rateLimiter: mockRateLimiter,
      schema: AppointmentRequestSchema,
    })

    // Assert
    const response = await result.json()
    expect(result.status).toBe(400)
    expect(response).toBe('Validation failed')
    expect(mockSendMail).not.toHaveBeenCalled()
  })
})
