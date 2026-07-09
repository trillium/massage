/**
 * Server-only referral config. Never imported by client code.
 *
 * Everything here comes from env — zero hardcoded PostHog hosts, keys, or
 * secrets. Property/param NAMES have sensible defaults (they are not secrets);
 * hosts, project keys, and the obfuscation secret are required from env and the
 * tagging path no-ops when they are missing.
 */

export type PosthogEnv = 'dev' | 'prod'

export interface RefServerConfig {
  /** PostHog kill-switch shared with the rest of the app. */
  disabled: boolean
  /** Obfuscation secret. Falls back to the public secret (obfuscation, not crypto). */
  secret: string | undefined
  /** PostHog ingest host, e.g. https://us.i.posthog.com. Required to capture. */
  host: string | undefined
  /** Project write key (phc_...) for the resolved env. Required to capture. */
  projectKey: string | undefined
  /** Which PostHog instance this config targets. */
  env: PosthogEnv
  /** Event name emitted alongside the person $set. */
  eventName: string
  /** Person property holding the decoded, human-readable referrer label. */
  propReferredBy: string
  /** Person property holding the raw opaque token. */
  propRefToken: string
  /** What to do when no distinct_id cookie is present. */
  fallback: 'defer' | 'generate'
}

/**
 * Resolve which PostHog instance to target. Explicit arg wins (the route passes
 * a host-derived value to mirror the client). Otherwise POSTHOG_ENV, else
 * NODE_ENV. Defaults to dev so a misconfigured server never writes to prod.
 */
export function resolvePosthogEnv(explicit?: PosthogEnv): PosthogEnv {
  if (explicit === 'dev' || explicit === 'prod') return explicit
  const fromEnv = process.env.POSTHOG_ENV
  if (fromEnv === 'dev' || fromEnv === 'prod') return fromEnv
  return process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
}

export function getRefServerConfig(opts: { env?: PosthogEnv } = {}): RefServerConfig {
  const env = resolvePosthogEnv(opts.env)
  const projectKey =
    env === 'prod'
      ? process.env.NEXT_PUBLIC_POSTHOG_KEY_PROD
      : process.env.NEXT_PUBLIC_POSTHOG_KEY_DEV

  return {
    disabled: process.env.NEXT_PUBLIC_DISABLE_POSTHOG === 'true',
    secret: process.env.REF_CODE_SECRET || process.env.NEXT_PUBLIC_REF_CODE_SECRET,
    host: process.env.POSTHOG_HOST,
    projectKey,
    env,
    eventName: process.env.REF_EVENT || 'referral_tagged',
    propReferredBy: process.env.REF_PROP_REFERRED_BY || 'referred_by',
    propRefToken: process.env.REF_PROP_TOKEN || 'ref_token',
    fallback: process.env.REF_TAG_FALLBACK === 'generate' ? 'generate' : 'defer',
  }
}
