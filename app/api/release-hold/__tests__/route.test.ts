import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockReleaseSlotHold = vi.fn()

vi.mock('@/lib/holds/releaseSlotHold', () => ({
  releaseSlotHold: (...args: unknown[]) => mockReleaseSlotHold(...args),
}))

import { POST } from '../route'
import { NextRequest } from 'next/server'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/release-hold', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/release-hold', () => {
  it('returns 200 and calls releaseSlotHold', async () => {
    mockReleaseSlotHold.mockResolvedValue(undefined)

    const res = await POST(makeRequest({ sessionId: SESSION_ID }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ success: true })
    expect(mockReleaseSlotHold).toHaveBeenCalledWith(SESSION_ID)
  })

  it('returns 400 for missing sessionId', async () => {
    const res = await POST(makeRequest({}))

    expect(res.status).toBe(400)
    expect(mockReleaseSlotHold).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid sessionId (not UUID)', async () => {
    const res = await POST(makeRequest({ sessionId: 'bad' }))

    expect(res.status).toBe(400)
    expect(mockReleaseSlotHold).not.toHaveBeenCalled()
  })
})
