export const SCOPE_DEFAULTS: Record<string, string> = {
  BC01: 'https://trilliummassage.la',
  HB01: 'https://trilliummassage.la/blog/airbnb-host-promo-2026-03',
}

export function scopeFromCode(code: string): string | null {
  const match = code.match(/^([A-Z]+\d+)[-_]/)
  return match ? match[1] : null
}

export function destinationForCode(code: string): string | null {
  const scope = scopeFromCode(code)
  return scope ? (SCOPE_DEFAULTS[scope] ?? null) : null
}
