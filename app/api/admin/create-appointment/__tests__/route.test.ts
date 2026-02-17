import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { POST } from '../route'

vi.mock('@/lib/adminAuthBridge', () => ({
  requireAdminWithFlag: vi.fn(),
}))

vi.mock('@/lib/messaging/templates/events/createAdminAppointment', () => ({
  default: vi.fn(async () => ({
    summary: 'Soothe Appointment',
    start: '2026-03-15T10:00:00',
    end: '2026-03-15T11:00:00',
  })),
}))

vi.mock('@/lib/messaging/templates/events/adminAppointmentDescription', () => ({
  default: vi.fn(async () => '<p>Soothe description</p>'),
}))

vi.mock('@/lib/messaging/templates/events/createManualAdminAppointment', () => ({
  default: vi.fn(async () => ({
    summary: 'Manual Appointment',
    start: '2026-03-15T10:00:00',
    end: '2026-03-15T11:00:00',
  })),
}))

vi.mock('@/lib/messaging/templates/events/manualAdminAppointmentDescription', () => ({
  default: vi.fn(async () => '<p>Manual description</p>'),
}))

vi.mock('@/lib/availability/createCalendarAppointment', () => ({
  default: vi.fn(),
}))

import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import createCalendarAppointment from '@/lib/availability/createCalendarAppointment'

const validSootheBody = {
  booking: {
    clientName: 'Jane Doe',
    sessionType: 'Swedish',
    duration: '60',
    messageId: 'msg-123',
    date: '2026-03-15',
    subject: 'New Soothe Booking',
    platform: 'Soothe',
  },
  selectedTime: { start: '10:00', end: '11:00' },
  selectedLocation: '123 Main St, LA',
  selectedDay: { year: 2026, month: 3, day: 15 },
}

const validManualBody = {
  booking: {
    clientName: 'John Smith',
    sessionType: 'Deep Tissue',
    duration: '90',
    platform: 'ManualEntry',
  },
  selectedTime: { start: '14:00', end: '15:30' },
  selectedLocation: '456 Oak Ave',
  selectedDay: { year: 2026, month: 3, day: 20 },
}

function postRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/create-appointment', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

const calendarEvent = {
  id: 'cal-123',
  summary: 'Test Appointment',
  start: { dateTime: '2026-03-15T10:00:00' },
  end: { dateTime: '2026-03-15T11:00:00' },
  location: '123 Main St',
  htmlLink: 'https://calendar.google.com/event?eid=abc',
}

beforeEach(() => {
  vi.mocked(requireAdminWithFlag).mockResolvedValue({ email: 'admin@test.com' })
  vi.mocked(createCalendarAppointment).mockResolvedValue({
    ok: true,
    json: async () => calendarEvent,
    text: async () => '',
  } as unknown as Response)
})

describe('/api/admin/create-appointment', () => {
  it('creates a Soothe platform booking', async () => {
    const res = await POST(postRequest(validSootheBody))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.event.id).toBe('cal-123')
  })

  it('creates a ManualEntry platform booking', async () => {
    const res = await POST(postRequest(validManualBody))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.message).toBe('Appointment created successfully')
  })

  it('returns 401 when not authorized', async () => {
    vi.mocked(requireAdminWithFlag).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )

    const res = await POST(postRequest(validSootheBody))
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 400 when booking is missing', async () => {
    const res = await POST(
      postRequest({
        selectedTime: { start: '10:00', end: '11:00' },
        selectedLocation: 'here',
        selectedDay: { year: 2026, month: 3, day: 15 },
      })
    )
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Missing required fields')
  })

  it('returns 400 when selectedTime is missing', async () => {
    const { selectedTime: _, ...body } = validSootheBody
    const res = await POST(postRequest(body))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Missing required fields')
  })

  it('returns 400 when selectedLocation is missing', async () => {
    const { selectedLocation: _, ...body } = validSootheBody
    const res = await POST(postRequest(body))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Missing required fields')
  })

  it('returns 400 when selectedDay is missing', async () => {
    const { selectedDay: _, ...body } = validSootheBody
    const res = await POST(postRequest(body))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Missing required fields')
  })

  it('returns 400 when Soothe booking is missing messageId', async () => {
    const body = {
      ...validSootheBody,
      booking: { ...validSootheBody.booking, messageId: undefined },
    }
    const res = await POST(postRequest(body))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('messageId')
  })

  it('returns 400 when selectedDay has invalid format', async () => {
    const body = {
      ...validSootheBody,
      selectedDay: { year: 'bad', month: 'bad', day: 'bad' },
    }
    const res = await POST(postRequest(body))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('selectedDay')
  })

  it('returns 500 when calendar API returns error', async () => {
    vi.mocked(createCalendarAppointment).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
      json: async () => ({}),
    } as unknown as Response)

    const res = await POST(postRequest(validSootheBody))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Failed to create appointment')
    expect(json.details).toContain('Calendar API error')
  })
})
