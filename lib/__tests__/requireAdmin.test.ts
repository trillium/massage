import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextResponse } from 'next/server'
import { AdminAuthManager } from '../adminAuth'

describe('requireAdmin', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns email when credentials are valid', () => {
    vi.spyOn(AdminAuthManager, 'validateAdminAccess').mockReturnValue(true)

    const request = new Request('http://localhost/api/admin/test', {
      headers: {
        'x-admin-email': 'admin@test.com',
        'x-admin-token': 'valid-token',
      },
    })

    const result = AdminAuthManager.requireAdmin(request)
    expect(result).toEqual({ email: 'admin@test.com' })
    expect(AdminAuthManager.validateAdminAccess).toHaveBeenCalledWith(
      'admin@test.com',
      'valid-token'
    )
  })

  it('returns 401 when headers are missing', () => {
    vi.spyOn(AdminAuthManager, 'validateAdminAccess').mockReturnValue(false)

    const request = new Request('http://localhost/api/admin/test')

    const result = AdminAuthManager.requireAdmin(request)
    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
  })

  it('returns 401 when token is invalid', () => {
    vi.spyOn(AdminAuthManager, 'validateAdminAccess').mockReturnValue(false)

    const request = new Request('http://localhost/api/admin/test', {
      headers: {
        'x-admin-email': 'admin@test.com',
        'x-admin-token': 'bad-token',
      },
    })

    const result = AdminAuthManager.requireAdmin(request)
    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
  })

  it('returns 401 when only email is provided', () => {
    vi.spyOn(AdminAuthManager, 'validateAdminAccess').mockReturnValue(false)

    const request = new Request('http://localhost/api/admin/test', {
      headers: { 'x-admin-email': 'admin@test.com' },
    })

    const result = AdminAuthManager.requireAdmin(request)
    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
    expect(AdminAuthManager.validateAdminAccess).toHaveBeenCalledWith('admin@test.com', null)
  })
})
