/**
 * Server-side referral tagging.
 *
 * Decode an opaque ?ref token to its human-readable label and tag the visitor's
 * PostHog person with `referred_by` (decoded) + `ref_token` (raw) via
 * posthog-node. The distinct_id is resolved by the caller from the ph_* cookie
 * so the properties land on the SAME person the browser is tracking.
 *
 * Never throws on bad input — unknown/blank/undecodable tokens are no-ops.
 */

import { randomUUID } from 'node:crypto'
import { PostHog } from 'posthog-node'
import { tryDecodeRef } from './refCodec'
import { getRefServerConfig, type PosthogEnv, type RefServerConfig } from './refServerConfig'

export type RefTagResult =
  | {
      status: 'tagged'
      distinctId: string
      referredBy: string
      refToken: string
      generatedId: boolean
    }
  | { status: 'deferred'; reason: string; refToken: string }
  | { status: 'skipped'; reason: string }

export interface TagReferralInput {
  refToken: string | null | undefined
  distinctId: string | null | undefined
}

export interface TagReferralOptions {
  /** Force a PostHog instance. The route derives this from the request host. */
  env?: PosthogEnv
  /** Inject config (tests). Defaults to env-derived config. */
  config?: RefServerConfig
}

let cached: { key: string; client: PostHog } | null = null

function getClient(config: RefServerConfig): PostHog | null {
  if (!config.host || !config.projectKey) return null
  const key = `${config.host}::${config.projectKey}`
  if (cached?.key === key) return cached.client
  cached = {
    key,
    client: new PostHog(config.projectKey, {
      host: config.host,
      flushAt: 1,
      flushInterval: 0,
    }),
  }
  return cached.client
}

export async function tagReferral(
  input: TagReferralInput,
  opts: TagReferralOptions = {}
): Promise<RefTagResult> {
  const config = opts.config ?? getRefServerConfig({ env: opts.env })

  if (config.disabled) return { status: 'skipped', reason: 'posthog disabled' }

  const token = input.refToken?.trim()
  if (!token) return { status: 'skipped', reason: 'no ref token' }
  if (!config.secret) return { status: 'skipped', reason: 'ref secret not configured' }

  const decoded = tryDecodeRef(token, config.secret)
  if (!decoded) return { status: 'skipped', reason: 'undecodable ref token' }

  let distinctId = input.distinctId?.trim() || null
  let generatedId = false
  if (!distinctId) {
    // No cookie yet. Default is to DEFER: capturing on a fresh random id would
    // create an orphan person that never merges with the real visitor. The
    // client tracker (which runs with the real distinct_id) still tags the
    // person. Set REF_TAG_FALLBACK=generate to capture on a throwaway id.
    if (config.fallback === 'defer') {
      return { status: 'deferred', reason: 'no posthog distinct_id cookie', refToken: token }
    }
    distinctId = `ref-anon-${randomUUID()}`
    generatedId = true
  }

  const client = getClient(config)
  if (!client) return { status: 'skipped', reason: 'posthog host/key not configured' }

  client.capture({
    distinctId,
    event: config.eventName,
    properties: {
      [config.propReferredBy]: decoded,
      [config.propRefToken]: token,
      $set: {
        [config.propReferredBy]: decoded,
        [config.propRefToken]: token,
      },
      ...(generatedId ? { ref_orphan: true } : {}),
    },
  })
  await client.flush()

  return { status: 'tagged', distinctId, referredBy: decoded, refToken: token, generatedId }
}
