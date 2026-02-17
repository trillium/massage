import { PostHog } from 'posthog-node'

let posthogInstance: PostHog | null = null

export function getPostHogServer(): PostHog | null {
  if (process.env.NEXT_PUBLIC_DISABLE_POSTHOG === 'true') return null

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY_PROD || process.env.NEXT_PUBLIC_POSTHOG_KEY_DEV

  if (!apiKey) return null

  if (!posthogInstance) {
    posthogInstance = new PostHog(apiKey, {
      host: 'https://us.i.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    })
  }

  return posthogInstance
}

export async function getFeatureFlag(
  flagName: string,
  distinctId: string
): Promise<boolean | string | undefined> {
  const client = getPostHogServer()
  if (!client) return undefined

  return client.getFeatureFlag(flagName, distinctId)
}

export async function isFeatureEnabled(flagName: string, distinctId: string): Promise<boolean> {
  const client = getPostHogServer()
  if (!client) return false

  const result = await client.isFeatureEnabled(flagName, distinctId)
  return result ?? false
}
