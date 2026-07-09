/**
 * Client-safe referral config.
 *
 * Only the query-param NAME lives here because it is needed on both the client
 * (building/reading ?ref) and the server (route handler). It is intentionally
 * NOT a secret. Server-only config (PostHog keys/host, property names) lives in
 * refServerConfig.ts so it never gets pulled into the browser bundle.
 */

/** Query-string param that carries the opaque ref token. Default: `ref`. */
export function refParam(): string {
  return process.env.NEXT_PUBLIC_REF_PARAM || 'ref'
}
