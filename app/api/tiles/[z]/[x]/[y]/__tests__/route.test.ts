import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

function tileRequest() {
  return new NextRequest('http://localhost/api/tiles/10/123/456')
}

function tileParams() {
  return { params: Promise.resolve({ z: '10', x: '123', y: '456' }) }
}

function mockFetchSuccess(buffer = new ArrayBuffer(8)) {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: true,
    arrayBuffer: async () => buffer,
  } as Response)
}

function mockFetchFailure() {
  vi.mocked(global.fetch).mockRejectedValueOnce(new Error('network error'))
}

function mockFetchNotOk() {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: false,
  } as Response)
}

describe('/api/tiles/[z]/[x]/[y]', () => {
  it('returns tile from first source (carto-light)', async () => {
    mockFetchSuccess()

    const res = await GET(tileRequest(), tileParams())

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/png')
    expect(res.headers.get('X-Tile-Source')).toBe('carto-light')
    expect(res.headers.get('Cache-Control')).toContain('max-age=2592000')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('basemaps.cartocdn.com'),
      expect.any(Object)
    )
  })

  it('falls back to second source when first fails', async () => {
    mockFetchNotOk()
    mockFetchSuccess()

    const res = await GET(tileRequest(), tileParams())

    expect(res.status).toBe(200)
    expect(res.headers.get('X-Tile-Source')).toBe('carto-light-b')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('falls back to OSM when both carto sources fail', async () => {
    mockFetchFailure()
    mockFetchNotOk()
    mockFetchSuccess()

    const res = await GET(tileRequest(), tileParams())

    expect(res.status).toBe(200)
    expect(res.headers.get('X-Tile-Source')).toBe('osm')
  })

  it('returns 503 SVG error tile when all sources fail', async () => {
    mockFetchFailure()
    mockFetchFailure()
    mockFetchFailure()

    const res = await GET(tileRequest(), tileParams())

    expect(res.status).toBe(503)
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
    expect(res.headers.get('Cache-Control')).toContain('max-age=3600')

    const body = await res.text()
    expect(body).toContain('Tile unavailable')
  })

  it('uses correct tile coordinates in URL', async () => {
    mockFetchSuccess()

    await GET(tileRequest(), tileParams())

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/10/123/456.png'),
      expect.any(Object)
    )
  })
})
