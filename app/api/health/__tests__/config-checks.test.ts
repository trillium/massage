import { afterEach, describe, expect, it, vi } from 'vitest'

interface ConfigCheck {
  ok: boolean
  warnings: string[]
}

function checkConfig(): ConfigCheck {
  const slug = process.env.TENANT_SLUG ?? ''
  const publicSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? ''
  const warnings: string[] = []

  if (slug && /[A-Z\s]/.test(slug)) {
    warnings.push('TENANT_SLUG contains uppercase or spaces — use snake_case')
  }
  if (slug && publicSlug && slug !== publicSlug) {
    warnings.push('TENANT_SLUG and NEXT_PUBLIC_TENANT_SLUG do not match')
  }

  return { ok: warnings.length === 0, warnings }
}

describe('checkConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns ok when TENANT_SLUG is valid snake_case and both slugs match', () => {
    vi.stubEnv('TENANT_SLUG', 'my_tenant')
    vi.stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'my_tenant')

    const result = checkConfig()

    expect(result).toEqual({ ok: true, warnings: [] })
  })

  it('warns when TENANT_SLUG has uppercase letters', () => {
    vi.stubEnv('TENANT_SLUG', 'MyTenant')
    vi.stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'MyTenant')

    const result = checkConfig()

    expect(result.ok).toBe(false)
    expect(result.warnings).toContain('TENANT_SLUG contains uppercase or spaces — use snake_case')
  })

  it('warns when TENANT_SLUG has spaces', () => {
    vi.stubEnv('TENANT_SLUG', 'my tenant')
    vi.stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'my tenant')

    const result = checkConfig()

    expect(result.ok).toBe(false)
    expect(result.warnings).toContain('TENANT_SLUG contains uppercase or spaces — use snake_case')
  })

  it('warns when TENANT_SLUG and NEXT_PUBLIC_TENANT_SLUG do not match', () => {
    vi.stubEnv('TENANT_SLUG', 'tenant_a')
    vi.stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'tenant_b')

    const result = checkConfig()

    expect(result.ok).toBe(false)
    expect(result.warnings).toContain('TENANT_SLUG and NEXT_PUBLIC_TENANT_SLUG do not match')
  })

  it('reports both warnings when slug has uppercase and slugs mismatch', () => {
    vi.stubEnv('TENANT_SLUG', 'MyTenant')
    vi.stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'other_tenant')

    const result = checkConfig()

    expect(result.ok).toBe(false)
    expect(result.warnings).toHaveLength(2)
    expect(result.warnings).toContain('TENANT_SLUG contains uppercase or spaces — use snake_case')
    expect(result.warnings).toContain('TENANT_SLUG and NEXT_PUBLIC_TENANT_SLUG do not match')
  })

  it('returns ok when TENANT_SLUG is empty (not configured yet)', () => {
    vi.stubEnv('TENANT_SLUG', '')
    vi.stubEnv('NEXT_PUBLIC_TENANT_SLUG', '')

    const result = checkConfig()

    expect(result).toEqual({ ok: true, warnings: [] })
  })
})
