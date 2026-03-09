export const SCOPE_DEFAULTS: Record<string, string> = {
  BC01: 'https://trilliummassage.la',
  HB01: 'https://trilliummassage.la/blog/airbnb-host-promo-2026-03',
}

export function scopeFromCode(code: string): string | null {
  const idx = code.indexOf('_')
  return idx > 0 ? code.substring(0, idx) : null
}

export function destinationForCode(code: string): string | null {
  const scope = scopeFromCode(code)
  return scope ? (SCOPE_DEFAULTS[scope] ?? null) : null
}
