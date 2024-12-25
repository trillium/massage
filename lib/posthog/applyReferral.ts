import { PostHog } from "posthog-node"
import { z } from "zod"

const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
  host: "https://us.i.posthog.com",
})

export async function applyReferral({
  searchParams,
}: {
  searchParams: URLSearchParams
}) {
  if (process.env.NEXT_PUBLIC_DISABLE_POSTHOG) return false
  
  const schema = z.object({
    ref: z
      .string()
      .regex(/^[A-Za-z0-9_-]+$/u)
      .optional(),
  })

  const { ref } = schema.parse(searchParams)

  if (ref) {
    client.capture({
      distinctId: "distinct_id",
      event: "referral code used",
      properties: {
        referral_id: ref,
      },
    })
  }

  console.log("Referral is " + ref)
}
