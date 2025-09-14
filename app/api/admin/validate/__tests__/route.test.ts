import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'
import { AdminAuthManager } from '@/lib/adminAuth'

// Mock AdminAuthManager
vi.mock('@/lib/adminAuth', () => ({
  AdminAuthManager: {
    validateAdminAccess: vi.fn(),
  },
}))

describe('/api/admin/validate', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.GOOGLE_OAUTH_SECRET = 'test_secret'
  })

  afterEach(() => {
    delete process.env.GOOGLE_OAUTH_SECRET
  })

  describe('POST /api/admin/validate', () => {
    it('should validate correct admin credentials', async () => {
      const email = 'admin@example.com'
      const token = 'valid-token-123'

      // Mock successful validation
      vi.mocked(AdminAuthManager.validateAdminAccess).mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/admin/validate', {
        method: 'POST',
        body: JSON.stringify({ email, token }),
        headers: { 'content-type': 'application/json' },
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result).toEqual({
        valid: true,
        email: email,
      })
      expect(AdminAuthManager.validateAdminAccess).toHaveBeenCalledWith(email, token)
    })

    it('should reject invalid admin credentials', async () => {
      const email = 'admin@example.com'
      const token = 'invalid-token'

      // Mock failed validation
      vi.mocked(AdminAuthManager.validateAdminAccess).mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/admin/validate', {
        method: 'POST',
        body: JSON.stringify({ email, token }),
        headers: { 'content-type': 'application/json' },
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result).toEqual({
        valid: false,
        email: null,
      })
      expect(AdminAuthManager.validateAdminAccess).toHaveBeenCalledWith(email, token)
    })

    it('should return 400 when email is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/validate', {
        method: 'POST',
        body: JSON.stringify({ token: 'some-token' }),
        headers: { 'content-type': 'application/json' },
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result).toEqual({ error: 'Email and token are required' })
      expect(AdminAuthManager.validateAdminAccess).not.toHaveBeenCalled()
    })

    it('should return 400 when token is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/validate', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com' }),
        headers: { 'content-type': 'application/json' },
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result).toEqual({ error: 'Email and token are required' })
      expect(AdminAuthManager.validateAdminAccess).not.toHaveBeenCalled()
    })

    it('should return 400 when both email and token are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/validate', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'content-type': 'application/json' },
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result).toEqual({ error: 'Email and token are required' })
      expect(AdminAuthManager.validateAdminAccess).not.toHaveBeenCalled()
    })

    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/validate', {
        method: 'POST',
        body: 'invalid-json',
        headers: { 'content-type': 'application/json' },
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result).toEqual({ error: 'Validation failed' })
      expect(AdminAuthManager.validateAdminAccess).not.toHaveBeenCalled()
    })

    it('should handle AdminAuthManager errors gracefully', async () => {
      const email = 'admin@example.com'
      const token = 'some-token'

      // Mock AdminAuthManager to throw an error
      vi.mocked(AdminAuthManager.validateAdminAccess).mockImplementation(() => {
        throw new Error('Validation service unavailable')
      })

      const request = new NextRequest('http://localhost:3000/api/admin/validate', {
        method: 'POST',
        body: JSON.stringify({ email, token }),
        headers: { 'content-type': 'application/json' },
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result).toEqual({ error: 'Validation failed' })
      expect(AdminAuthManager.validateAdminAccess).toHaveBeenCalledWith(email, token)
    })
  })
})
