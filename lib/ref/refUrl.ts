/**
 * Client-safe helpers for minting and reading shareable ref URLs.
 *
 * Shares the ONE obfuscation module (refCodec). Uses the public secret, which
 * necessarily ships in the browser bundle — fine, because this is obfuscation,
 * not encryption. Use this from a share/admin surface to build ?ref links.
 */

import { encodeRef, decodeRef } from './refCodec'
import { refParam } from './refConfig'

function requireSecret(secret: string | undefined): string {
  if (!secret) throw new Error('refUrl: NEXT_PUBLIC_REF_CODE_SECRET is required')
  return secret
}

/** Encode a human-readable label into an opaque token. */
export function refTokenFor(
  label: string,
  secret: string | undefined = process.env.NEXT_PUBLIC_REF_CODE_SECRET
): string {
  return encodeRef(label, requireSecret(secret))
}

/** Build a shareable URL with the opaque token on the configured ref param. */
export function buildRefUrl(
  label: string,
  baseUrl: string,
  secret: string | undefined = process.env.NEXT_PUBLIC_REF_CODE_SECRET
): string {
  const url = new URL(baseUrl)
  url.searchParams.set(refParam(), refTokenFor(label, secret))
  return url.toString()
}

/** Read a label back out of a ref URL for display. Returns null if undecodable. */
export function labelFromRefUrl(
  url: string,
  secret: string | undefined = process.env.NEXT_PUBLIC_REF_CODE_SECRET
): string | null {
  if (!secret) return null
  let token: string | null
  try {
    token = new URL(url).searchParams.get(refParam())
  } catch {
    return null
  }
  if (!token) return null
  try {
    return decodeRef(token, secret)
  } catch {
    return null
  }
}
