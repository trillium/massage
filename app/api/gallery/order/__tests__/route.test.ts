import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockWriteFile = vi.fn()

vi.mock('fs/promises', () => ({
  writeFile: mockWriteFile,
  default: { writeFile: mockWriteFile },
}))

const { POST } = await import('../route')

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/gallery/order', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  mockWriteFile.mockReset()
  mockWriteFile.mockResolvedValue(undefined)
})

describe('/api/gallery/order', () => {
  it('writes gallery order and returns success', async () => {
    const images = ['img1.jpg', 'img2.jpg']
    const res = await POST(makeRequest({ images, hidden: ['img3.jpg'] }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('gallery-order.json'),
      expect.stringContaining('img1.jpg')
    )
  })

  it('defaults hidden to empty array', async () => {
    const res = await POST(makeRequest({ images: ['img1.jpg'] }))
    const json = await res.json()

    expect(json.ok).toBe(true)
    const writeCall = mockWriteFile.mock.calls[0]
    expect(writeCall[1]).toContain('"hidden": []')
  })

  it('returns 500 when writeFile fails', async () => {
    mockWriteFile.mockRejectedValueOnce(new Error('disk full'))

    const res = await POST(makeRequest({ images: ['img1.jpg'] }))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.ok).toBe(false)
  })
})
