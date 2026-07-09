/**
 * LIVE PostHog round-trip — DEV instance only.
 *
 * Proves the full chain: encode(label) -> tagReferral decodes + captures ->
 * read the person back via the Persons API -> referred_by + ref_token match.
 *
 * Gated on dev-only env. When any var is missing the whole suite skips with a
 * clear message, so CI without secrets stays green. It NEVER targets prod:
 * config is forced to env 'dev' and only the dev project id/keys are read.
 *
 *   POSTHOG_HOST                  ingest host (e.g. https://us.i.posthog.com)
 *   NEXT_PUBLIC_POSTHOG_KEY_DEV   dev project write key (phc_...)
 *   NEXT_PUBLIC_REF_CODE_SECRET   obfuscation secret
 *   POSTHOG_PERSONAL_API_KEY      personal API key (phx_...) for readback
 *   POSTHOG_PROJECT_ID_DEV        numeric dev project id for the Persons API
 *   POSTHOG_API_HOST              optional; app host for the API (default: strip `i.` from POSTHOG_HOST)
 */

import { describe, it, expect } from 'vitest'
import { encodeRef } from '@/lib/ref/refCodec'
import { tagReferral } from '@/lib/ref/serverRefTag'

const host = process.env.POSTHOG_HOST
const writeKey = process.env.NEXT_PUBLIC_POSTHOG_KEY_DEV
const secret = process.env.NEXT_PUBLIC_REF_CODE_SECRET
const personalKey = process.env.POSTHOG_PERSONAL_API_KEY
const projectId = process.env.POSTHOG_PROJECT_ID_DEV

const missing = [
  ['POSTHOG_HOST', host],
  ['NEXT_PUBLIC_POSTHOG_KEY_DEV', writeKey],
  ['NEXT_PUBLIC_REF_CODE_SECRET', secret],
  ['POSTHOG_PERSONAL_API_KEY', personalKey],
  ['POSTHOG_PROJECT_ID_DEV', projectId],
]
  .filter(([, v]) => !v)
  .map(([k]) => k)

const apiHost =
  process.env.POSTHOG_API_HOST || (host ? host.replace('://i.', '://').replace('.i.', '.') : '')

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function readPerson(distinctId: string): Promise<Record<string, unknown> | null> {
  const url = `${apiHost}/api/projects/${projectId}/persons/?distinct_id=${encodeURIComponent(distinctId)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${personalKey}` } })
  if (!res.ok) return null
  const body = (await res.json()) as { results?: Array<{ properties?: Record<string, unknown> }> }
  return body.results?.[0]?.properties ?? null
}

const suite = missing.length ? describe.skip : describe
if (missing.length) {
  console.log(`[ref integration] skipped — set dev env to run: ${missing.join(', ')}`)
}

suite('referral tagging — live dev round-trip', () => {
  it('encode -> visit(tag) -> readback: referred_by + ref_token land on the person', async () => {
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`
    const label = `itest-src-${stamp}`
    const distinctId = `ref-itest-${stamp}`
    const token = encodeRef(label, secret as string)

    const result = await tagReferral({ refToken: token, distinctId }, { env: 'dev' })
    expect(result.status).toBe('tagged')

    let props: Record<string, unknown> | null = null
    for (let attempt = 0; attempt < 12 && !props?.referred_by; attempt++) {
      await sleep(2500)
      props = await readPerson(distinctId)
    }

    expect(props).toBeTruthy()
    expect(props?.referred_by).toBe(label)
    expect(props?.ref_token).toBe(token)
  }, 60_000)
})
