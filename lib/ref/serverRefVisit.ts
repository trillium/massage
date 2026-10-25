import { randomUUID } from 'node:crypto'
import { PostHog } from 'posthog-node'
import { tryDecodeRef } from './refCodec'
import { getRefServerConfig, type PosthogEnv } from './refServerConfig'

export const REF_VISIT_EVENT = 'ref_link_visit'
const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com'

export interface RefVisitInput {
  code: string
  source: string
  destination: string
  userAgent: string | null
  referrer: string | null
  env?: PosthogEnv
}

let cached: { key: string; client: PostHog } | null = null

function getClient(host: string, projectKey: string): PostHog {
  const key = `${host}::${projectKey}`
  if (cached?.key === key) return cached.client
  cached = { key, client: new PostHog(projectKey, { host, flushAt: 1, flushInterval: 0 }) }
  return cached.client
}

export async function captureRefVisit(input: RefVisitInput): Promise<void> {
  const config = getRefServerConfig({ env: input.env })
  if (config.disabled || !config.projectKey) return

  const decoded = config.secret ? tryDecodeRef(input.code, config.secret) : null
  const client = getClient(config.host ?? DEFAULT_POSTHOG_HOST, config.projectKey)
  client.capture({
    distinctId: `scan-${randomUUID()}`,
    event: REF_VISIT_EVENT,
    properties: {
      ref: input.code,
      ref_decoded: decoded,
      source: input.source,
      destination: input.destination,
      user_agent: input.userAgent,
      referrer: input.referrer,
      $process_person_profile: false,
    },
  })
  await client.flush()
}
