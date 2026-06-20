export const SCOPE_DEFAULTS: Record<string, string> = {
  BC01: 'https://trilliummassage.la',
  BC02: 'https://trilliummassage.la',
  BC03: 'https://trilliummassage.la',
  BC04: 'https://trilliummassage.la',
  BC05: 'https://trilliummassage.la',
  BC06: 'https://trilliummassage.la',
  BCR01: 'https://trilliummassage.la/overtime',
  AFSR01: 'https://trilliummassage.la/tesla-charging',
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
