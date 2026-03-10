import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockClaimSlotHold = vi.fn()

vi.mock('@/lib/holds/claimSlotHold', () => ({
  claimSlotHold: (...args: unknown[]) => mockClaimSlotHold(...args),
}))

import { POST } from '../route'
import { NextRequest } from 'next/server'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/hold-slot', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const VALID_BODY = {
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
  start: '2026-03-15T10:00:00Z',
  end: '2026-03-15T11:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/hold-slot', () => {
  it('returns 200 with holdId on successful claim', async () => {
    mockClaimSlotHold.mockResolvedValue({ success: true, holdId: 'hold-abc' })

    const res = await POST(makeRequest(VALID_BODY))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ success: true, holdId: 'hold-abc' })
    expect(mockClaimSlotHold).toHaveBeenCalledWith(
      VALID_BODY.sessionId,
      VALID_BODY.start,
      VALID_BODY.end
    )
  })

  it('returns 409 when slot is already held', async () => {
    mockClaimSlotHold.mockResolvedValue({ success: false, reason: 'slot_held' })

    const res = await POST(makeRequest(VALID_BODY))
    const json = await res.json()

    expect(res.status).toBe(409)
    expect(json).toEqual({ success: false, reason: 'slot_held' })
  })

  it('returns 400 for missing sessionId', async () => {
    const res = await POST(makeRequest({ start: VALID_BODY.start, end: VALID_BODY.end }))

    expect(res.status).toBe(400)
    expect(mockClaimSlotHold).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid sessionId (not UUID)', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, sessionId: 'not-a-uuid' }))

    expect(res.status).toBe(400)
    expect(mockClaimSlotHold).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid datetime format', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, start: 'tomorrow' }))

    expect(res.status).toBe(400)
    expect(mockClaimSlotHold).not.toHaveBeenCalled()
  })

  it('returns 400 for empty body', async () => {
    const res = await POST(makeRequest({}))

    expect(res.status).toBe(400)
  })
})
