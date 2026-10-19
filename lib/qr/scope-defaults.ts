/**
 * Canonical destination URL for each QR scope prefix.
 *
 * A "scope" is the campaign/batch identifier embedded as the prefix of every
 * QR code slug (e.g. `BC01` in `BC01-abc123-xyz`). All codes within a scope
 * resolve to the same landing URL; the scope is the unit of campaign tracking.
 *
 * Keys are scope prefixes (uppercase letters followed by digits). Values are
 * absolute URLs. Used by `verify.ts` and `scripts/generate-pdf-print.ts` to
 * check that generated QRs encode the expected destination.
 */
export const SCOPE_DEFAULTS: Record<string, string> = {
  BC01: 'https://trilliummassage.la',
  BC02: 'https://trilliummassage.la',
  BC03: 'https://trilliummassage.la',
  BC04: 'https://trilliummassage.la',
  BC05: 'https://trilliummassage.la',
  BC06: 'https://trilliummassage.la',
  BCR01: 'https://trilliummassage.la/overtime',
  AFSR01: 'https://trilliummassage.la/edge-office-hours',
  HB01: 'https://trilliummassage.la/blog/airbnb-host-promo-2026-03',
}

/**
 * Extracts the scope prefix from a full QR code slug.
 *
 * QR slugs follow the shape `<SCOPE>[-_]<rest>`, where `<SCOPE>` is one or
 * more uppercase letters immediately followed by one or more digits
 * (e.g. `BC01`, `BCR01`, `AFSR01`). The first `-` or `_` terminates the scope.
 *
 * @param code - Full QR code slug (e.g. `"BC01-abc123-xyz"`).
 * @returns The scope prefix (e.g. `"BC01"`), or `null` if `code` doesn't
 *          start with `<letters><digits><-|_>`.
 *
 * @example
 * scopeFromCode("BC01-abc123")   // "BC01"
 * scopeFromCode("BCR01_v2")      // "BCR01"
 * scopeFromCode("loose-string")  // null
 */
export function scopeFromCode(code: string): string | null {
  const match = code.match(/^([A-Z]+\d+)[-_]/)
  return match ? match[1] : null
}

/**
 * Resolves a QR code slug to its registered destination URL.
 *
 * Parses the scope prefix off `code` via `scopeFromCode`, then looks the scope
 * up in `SCOPE_DEFAULTS`. Returns `null` for either an unparseable slug or a
 * scope that isn't registered — callers should treat both as "no destination".
 *
 * @param code - Full QR code slug (e.g. `"BC01-abc123-xyz"`).
 * @returns The canonical destination URL for the slug's scope, or `null` if
 *          the scope can't be parsed or isn't in `SCOPE_DEFAULTS`.
 *
 * @example
 * destinationForCode("BC01-abc123")   // "https://trilliummassage.la"
 * destinationForCode("HB01-foo")      // "https://trilliummassage.la/blog/airbnb-host-promo-2026-03"
 * destinationForCode("ZZ99-foo")      // null (scope not registered)
 * destinationForCode("not-a-slug")    // null (no scope prefix)
 */
export function destinationForCode(code: string): string | null {
  const scope = scopeFromCode(code)
  return scope ? (SCOPE_DEFAULTS[scope] ?? null) : null
}
