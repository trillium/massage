import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// ─── mocks ────────────────────────────────────────────────────────────────────

const { mockRequireAdminWithFlag, mockGetSupabaseAdminClient } = vi.hoisted(() => ({
  mockRequireAdminWithFlag: vi.fn(),
  mockGetSupabaseAdminClient: vi.fn(),
}))

vi.mock('@/lib/adminAuthBridge', () => ({
  requireAdminWithFlag: mockRequireAdminWithFlag,
}))

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: mockGetSupabaseAdminClient,
}))

import { POST, GET } from '../route'

// ─── helpers ──────────────────────────────────────────────────────────────────

function makePost(host: string, body: object = { type: 'submit', payload: { id: 'x', data: {} } }) {
  return new NextRequest('http://ignored/api/feedtack', {
    method: 'POST',
    headers: { host, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeGet(host: string, pathname?: string) {
  const url = new URL('http://ignored/api/feedtack')
  if (pathname) url.searchParams.set('pathname', pathname)
  return new NextRequest(url, { method: 'GET', headers: { host } })
}

function makeDB(insertResult: { error: { message: string } | null } = { error: null }) {
  return {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue(insertResult),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  // Default: admin check passes, DB available
  mockRequireAdminWithFlag.mockResolvedValue(undefined)
  mockGetSupabaseAdminClient.mockReturnValue(makeDB())
})

// ─── isDevHost — POST ─────────────────────────────────────────────────────────

describe('POST — host restriction', () => {
  it('returns 404 for a production domain', async () => {
    const res = await POST(makePost('example.com'))
    expect(res.status).toBe(404)
  })

  it('returns 404 for a domain that starts with "notdev"', async () => {
    const res = await POST(makePost('notdev.example.com'))
    expect(res.status).toBe(404)
  })

  it('does NOT return 404 for localhost', async () => {
    const res = await POST(makePost('localhost'))
    expect(res.status).not.toBe(404)
  })

  it('does NOT return 404 for localhost with port', async () => {
    const res = await POST(makePost('localhost:9876'))
    expect(res.status).not.toBe(404)
  })

  it('does NOT return 404 for dev.example.com', async () => {
    const res = await POST(makePost('dev.example.com'))
    expect(res.status).not.toBe(404)
  })

  it('does NOT return 404 for test.example.com', async () => {
    const res = await POST(makePost('test.example.com'))
    expect(res.status).not.toBe(404)
  })
})

// ─── isDevHost — GET ──────────────────────────────────────────────────────────

describe('GET — host restriction', () => {
  it('returns 404 for a production domain', async () => {
    const res = await GET(makeGet('example.com'))
    expect(res.status).toBe(404)
  })

  it('does NOT return 404 for localhost', async () => {
    const res = await GET(makeGet('localhost'))
    expect(res.status).not.toBe(404)
  })
})

// ─── admin-only types ─────────────────────────────────────────────────────────

describe('POST — admin-only gate', () => {
  it('calls requireAdminWithFlag for type=reply', async () => {
    await POST(makePost('localhost', { type: 'reply', feedbackId: 'f1', reply: { note: 'hi' } }))
    expect(mockRequireAdminWithFlag).toHaveBeenCalled()
  })

  it('calls requireAdminWithFlag for type=resolve', async () => {
    await POST(
      makePost('localhost', { type: 'resolve', feedbackId: 'f1', resolution: { note: 'fixed' } })
    )
    expect(mockRequireAdminWithFlag).toHaveBeenCalled()
  })

  it('calls requireAdminWithFlag for type=archive', async () => {
    await POST(makePost('localhost', { type: 'archive', feedbackId: 'f1', userId: 'u1' }))
    expect(mockRequireAdminWithFlag).toHaveBeenCalled()
  })

  it('does NOT call requireAdminWithFlag for type=submit', async () => {
    await POST(makePost('localhost', { type: 'submit', payload: { id: 'x', data: {} } }))
    expect(mockRequireAdminWithFlag).not.toHaveBeenCalled()
  })

  it('short-circuits with admin response when requireAdminWithFlag returns NextResponse', async () => {
    const authBlock = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    mockRequireAdminWithFlag.mockResolvedValue(authBlock)

    const res = await POST(makePost('localhost', { type: 'reply', feedbackId: 'f1', reply: {} }))
    expect(res.status).toBe(401)
  })
})

// ─── unknown type ─────────────────────────────────────────────────────────────

describe('POST — unknown type', () => {
  it('returns 400 for an unrecognized type', async () => {
    const res = await POST(makePost('localhost', { type: 'unknown' }))
    expect(res.status).toBe(400)
  })
})

// ─── DB unavailable ───────────────────────────────────────────────────────────

describe('POST — DB unavailable', () => {
  it('returns 503 when getSupabaseAdminClient returns null', async () => {
    mockGetSupabaseAdminClient.mockReturnValue(null)
    const res = await POST(makePost('localhost'))
    expect(res.status).toBe(503)
  })
})

// ─── successful submit ────────────────────────────────────────────────────────

describe('POST — successful submit', () => {
  it('returns { ok: true } when submit succeeds', async () => {
    const res = await POST(
      makePost('localhost', { type: 'submit', payload: { id: 'x', data: {} } })
    )
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
  })

  it('returns 500 when the DB insert returns an error', async () => {
    mockGetSupabaseAdminClient.mockReturnValue(
      makeDB({ error: { message: 'constraint violation' } })
    )
    const res = await POST(
      makePost('localhost', { type: 'submit', payload: { id: 'x', data: {} } })
    )
    expect(res.status).toBe(500)
  })
})
