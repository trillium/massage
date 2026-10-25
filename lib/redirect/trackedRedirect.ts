import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PostHog } from 'posthog-node'
import { getRefServerConfig } from '@/lib/ref/refServerConfig'

export const REDIRECT_PATH_PREFIX = '/redirect/'
export const REDIRECT_SCAN_EVENT = 'redirect_scanned'
const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com'

export interface RedirectTrack {
  source: string
  campaign: string
  concept: string
}

export interface TrackedRedirect {
  slug: string
  destination: string
  track: RedirectTrack
}

export interface ScanContext {
  userAgent: string | null
  referrer: string | null
}

function readRedirectLines(): string[] {
  const path = join(process.cwd(), 'redirects.jsonl')
  return readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean)
}

export function findTrackedRedirect(slug: string): TrackedRedirect | null {
  const source = `${REDIRECT_PATH_PREFIX}${slug}`
  for (const line of readRedirectLines()) {
    const entry = JSON.parse(line)
    if (entry.source === source && entry.track) {
      return { slug, destination: entry.destination, track: entry.track }
    }
  }
  return null
}

let cached: { key: string; client: PostHog } | null = null

function getClient(host: string, projectKey: string): PostHog {
  const key = `${host}::${projectKey}`
  if (cached?.key === key) return cached.client
  cached = {
    key,
    client: new PostHog(projectKey, { host, flushAt: 1, flushInterval: 0 }),
  }
  return cached.client
}

export async function captureRedirectScan(
  redirect: TrackedRedirect,
  context: ScanContext,
  hostname: string
): Promise<void> {
  const config = getRefServerConfig({
    env: hostname.endsWith('trilliummassage.la') ? 'prod' : 'dev',
  })
  if (config.disabled || !config.projectKey) return

  const client = getClient(config.host ?? DEFAULT_POSTHOG_HOST, config.projectKey)
  client.capture({
    distinctId: `scan-${randomUUID()}`,
    event: REDIRECT_SCAN_EVENT,
    properties: {
      source: redirect.track.source,
      campaign: redirect.track.campaign,
      concept: redirect.track.concept,
      slug: redirect.slug,
      destination: redirect.destination,
      user_agent: context.userAgent,
      referrer: context.referrer,
      $process_person_profile: false,
    },
  })
  await client.flush()
}
