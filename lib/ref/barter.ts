import { buildRefUrl } from './refUrl'

export const BARTER_TAG_PREFIX = 'b-'
export const BARTER_PATH = '/barter'
export const MAX_PART_LENGTH = 24

export interface BarterTagParts {
  show: string
  client: string
}

export function normalizeShow(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function normalizeClient(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function requireTagPart(name: 'show' | 'client', value: string): string {
  if (!value) throw new Error(`barterTag: ${name} is required`)
  if (value.length > MAX_PART_LENGTH) {
    throw new Error(`barterTag: ${name} is too long (${MAX_PART_LENGTH} characters max)`)
  }
  return value
}

export function barterTag(show: string, client: string): string {
  const normalizedShow = requireTagPart('show', normalizeShow(show))
  const normalizedClient = requireTagPart('client', normalizeClient(client))
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
