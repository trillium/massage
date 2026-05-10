export const SCOPE_DEFAULTS: Record<string, string> = {
  BC01: 'https://yourdomain.com',
  HB01: 'https://yourdomain.com/blog/your-blog-post',
}

export function scopeFromCode(code: string): string | null {
  const match = code.match(/^([A-Z]+\d+)[-_]/)
  return match ? match[1] : null
}

export function destinationForCode(code: string): string | null {
  const scope = scopeFromCode(code)
  return scope ? (SCOPE_DEFAULTS[scope] ?? null) : null
}
