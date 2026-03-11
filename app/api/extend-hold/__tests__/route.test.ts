import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockExtendSlotHold = vi.fn()

vi.mock('@/lib/holds/extendSlotHold', () => ({
  extendSlotHold: (...args: unknown[]) => mockExtendSlotHold(...args),
}))

import { POST } from '../route'
import { NextRequest } from 'next/server'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/extend-hold', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const VALID_BODY = {
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/extend-hold', () => {
  it('returns 200 on successful extend', async () => {
    mockExtendSlotHold.mockResolvedValue({ extended: true })

    const res = await POST(makeRequest(VALID_BODY))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ extended: true })
    expect(mockExtendSlotHold).toHaveBeenCalledWith(VALID_BODY.sessionId)
  })

  it('returns 410 when hold has expired', async () => {
    mockExtendSlotHold.mockResolvedValue({ extended: false, reason: 'hold_expired' })

    const res = await POST(makeRequest(VALID_BODY))
    const json = await res.json()

    expect(res.status).toBe(410)
    expect(json).toEqual({ extended: false, reason: 'hold_expired' })
  })

  it('returns 400 for missing sessionId', async () => {
    const res = await POST(makeRequest({}))

    expect(res.status).toBe(400)
    expect(mockExtendSlotHold).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid sessionId (not UUID)', async () => {
    const res = await POST(makeRequest({ sessionId: 'not-a-uuid' }))

    expect(res.status).toBe(400)
    expect(mockExtendSlotHold).not.toHaveBeenCalled()
  })

  it('returns 400 for empty body', async () => {
    const res = await POST(makeRequest({}))

    expect(res.status).toBe(400)
  })
})
