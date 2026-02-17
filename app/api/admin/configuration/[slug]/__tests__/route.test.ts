import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

vi.mock('@/lib/slugConfigurations/helpers/resolveConfiguration', () => ({
  resolveConfiguration: vi.fn(),
}))

import { resolveConfiguration } from '@/lib/slugConfigurations/helpers/resolveConfiguration'

describe('/api/admin/configuration/[slug]', () => {
  it('returns configuration for valid slug', async () => {
    const mockConfig = { type: 'area-wide', title: 'Test' }
    vi.mocked(resolveConfiguration).mockResolvedValue({
      configuration: mockConfig as never,
      bookingSlug: 'test',
    })

    const req = new NextRequest('http://localhost/api/admin/configuration/test')
    const res = await GET(req, { params: Promise.resolve({ slug: 'test' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual(mockConfig)
  })

  it('returns 400 when slug is empty', async () => {
    const req = new NextRequest('http://localhost/api/admin/configuration/')
    const res = await GET(req, { params: Promise.resolve({ slug: '' }) })
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Slug is required')
  })

  it('returns 404 when resolveConfiguration throws', async () => {
    vi.mocked(resolveConfiguration).mockRejectedValue(new Error('not found'))

    const req = new NextRequest('http://localhost/api/admin/configuration/bad')
    const res = await GET(req, { params: Promise.resolve({ slug: 'bad' }) })
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toBe('Configuration not found')
  })
})
