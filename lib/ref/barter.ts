/**
 * Barter shortlink helpers — trade-show links unique to one client.
 *
 * Tag convention: `b-<show>-<client>` where <show> is dash-free (so the tag
 * splits unambiguously) and <client> may contain dashes. Tags are human labels,
 * never PII — the codec is obfuscation, not encryption. See docs/BARTER.md.
 */

import { buildRefUrl } from './refUrl'

export const BARTER_TAG_PREFIX = 'b-'
export const BARTER_PATH = '/barter'

export interface BarterTagParts {
  show: string
  client: string
}

export function normalizeShow(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24)
}

export function normalizeClient(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
    .replace(/-+$/g, '')
}

export function barterTag(show: string, client: string): string {
  const normalizedShow = normalizeShow(show)
  const normalizedClient = normalizeClient(client)
  if (!normalizedShow) throw new Error('barterTag: show is required')
  if (!normalizedClient) throw new Error('barterTag: client is required')
  return `${BARTER_TAG_PREFIX}${normalizedShow}-${normalizedClient}`
}

export function parseBarterTag(tag: string): BarterTagParts | null {
  if (!tag.startsWith(BARTER_TAG_PREFIX)) return null
  const rest = tag.slice(BARTER_TAG_PREFIX.length)
  const separator = rest.indexOf('-')
  if (separator <= 0 || separator === rest.length - 1) return null
  return { show: rest.slice(0, separator), client: rest.slice(separator + 1) }
}

export function buildBarterUrl(
  show: string,
  client: string,
  baseUrl: string,
  secret: string | undefined = process.env.NEXT_PUBLIC_REF_CODE_SECRET
): string {
  const base = `${baseUrl.replace(/\/$/, '')}${BARTER_PATH}`
  return buildRefUrl(barterTag(show, client), base, secret)
}

export function barterSmsMessage(url: string): string {
  return `Great meeting you! Here's your personal booking link for your massage session: ${url}`
}

export function barterSmsHref(url: string): string {
  return `sms:?&body=${encodeURIComponent(barterSmsMessage(url))}`
}
