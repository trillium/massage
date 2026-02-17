import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/adminAuthBridge', () => ({
  requireAdminWithFlag: vi.fn().mockResolvedValue({ email: 'admin@test.com' }),
}))

const mockInsert = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({
      insert: (data: unknown) => {
        mockInsert(data)
        return {
          select: () => ({ single: () => ({ data: { id: 1, ...(data as object) }, error: null }) }),
        }
      },
      update: (data: unknown) => {
        mockUpdate(data)
        return {
          eq: () => ({
            select: () => ({
              single: () => ({ data: { id: 1, ...(data as object) }, error: null }),
            }),
          }),
        }
      },
    }),
  }),
}))

import { POST, PATCH } from '../route'

function makeRequest(method: string, body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/reviews', {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('/api/admin/reviews', () => {
  describe('POST', () => {
    it('creates a review', async () => {
      const res = await POST(
        makeRequest('POST', {
          name: 'Jane Doe',
          rating: 5,
          date: '2026-02-17',
          source: 'Soothe',
          comment: 'Great massage',
        })
      )
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.ok).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane Doe', rating: 5 })
      )
    })

    it('returns 400 for invalid data', async () => {
      const res = await POST(makeRequest('POST', { name: '' }))
      expect(res.status).toBe(400)
    })

    it('returns 400 for invalid rating', async () => {
      const res = await POST(
        makeRequest('POST', { name: 'Jane', rating: 6, date: '2026-02-17', source: 'Soothe' })
      )
      expect(res.status).toBe(400)
    })
  })

  describe('PATCH', () => {
    it('updates a review', async () => {
      const res = await PATCH(makeRequest('PATCH', { id: 1, name: 'Updated Name', rating: 4 }))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.ok).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Updated Name', rating: 4 })
      )
    })

    it('returns 400 without id', async () => {
      const res = await PATCH(makeRequest('PATCH', { name: 'No ID' }))
      expect(res.status).toBe(400)
    })
  })
})
