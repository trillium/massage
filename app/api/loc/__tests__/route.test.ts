import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

vi.mock('lib/availability/updateLocation', () => ({
  default: vi.fn(() => Promise.resolve({ success: true })),
}))

import updateLocation from 'lib/availability/updateLocation'

const originalEnv = process.env

beforeEach(() => {
  vi.clearAllMocks()
  process.env = { ...originalEnv, UPDATE_LOC_PASSWORD: 'secret123' }
})

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/loc')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new NextRequest(url)
}

describe('/api/loc', () => {
  it('updates location with correct password', async () => {
    const res = await GET(
      makeRequest({ password: 'secret123', location: '123 Main St', city: 'LA', zipCode: '90001' })
    )
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(updateLocation).toHaveBeenCalledWith({
      location: '123 Main St',
      city: 'LA',
      zipCode: '90001',
    })
  })

  it('returns 400 with wrong password', async () => {
    const res = await GET(makeRequest({ password: 'wrong', location: '123 Main St' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Access denied.')
    expect(updateLocation).not.toHaveBeenCalled()
  })

  it('returns 400 with no password', async () => {
    const res = await GET(makeRequest({ location: '123 Main St' }))
    const json = await res.json()

    expect(res.status).toBe(400)
  })
})
