'use client'

import { useState } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/lib/siteConfig'
import { buildRefUrl, refTokenFor } from '@/lib/ref/refUrl'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { H2, H3 } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TextSm, TextSmMuted, TextXs } from '@/components/ui/text'
import { Code } from '@/components/ui/code'

const BASE_URL = siteConfig.domain.siteUrl.replace(/\/$/, '')

export default function RefLinksPage() {
  const [label, setLabel] = useState('')
  const [minted, setMinted] = useState<{ label: string; token: string; url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function mint() {
    const tag = label.trim()
    setCopied(false)
    if (!tag) {
      setError('Enter a label first.')
      return
    }
    try {
      setMinted({ label: tag, token: refTokenFor(tag), url: buildRefUrl(tag, BASE_URL) })
      setError(null)
    } catch {
      setError('NEXT_PUBLIC_REF_CODE_SECRET is not set — cannot mint codes.')
      setMinted(null)
    }
  }

  async function copy() {
    if (!minted) return
    await navigator.clipboard.writeText(minted.url)
    setCopied(true)
  }

  return (
    <Stack direction="col" gap={6}>
      <Box>
        <H2 className="dark:text-white">Mint a referral link</H2>
        <TextSmMuted>
          Turn a short label into an opaque <Code>?ref=</Code> link. Share it; PostHog then tags
          everyone who clicks with <Code>referred_by: &lt;label&gt;</Code> and follows them through
          bookings. At a trade show?{' '}
          <Link href="/admin/ref-links/barter" className="underline">
            Mint a barter link →
          </Link>
        </TextSmMuted>
      </Box>

      <Box className="max-w-xl rounded-lg bg-surface-50 p-6 shadow-md dark:bg-surface-800">
        <Stack direction="col" gap={4}>
          <Input
            id="ref-label"
            label="Label (a short name — never a phone number or email)"
            placeholder="kris  ·  kris-3333  ·  instagram-bio"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && mint()}
            error={error ?? undefined}
          />
          <Box>
            <Button onClick={mint}>Mint link</Button>
          </Box>

          {minted && (
            <Box className="rounded-md border border-accent-300 bg-surface-100 p-4 dark:border-accent-600 dark:bg-surface-700">
              <Stack direction="col" gap={2}>
                <TextXs>
                  {minted.label} → {minted.token}
                </TextXs>
                <Box className="break-all font-mono text-sm text-accent-900 dark:text-accent-100">
                  {minted.url}
                </Box>
                <Box>
                  <Button variant="outline" onClick={copy}>
                    {copied ? 'Copied ✓' : 'Copy link'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>

      <Box className="max-w-xl rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20">
        <H3 className="dark:text-white">Keep labels non-PII</H3>
        <TextSm>
          This is obfuscation, not encryption — the secret ships in the browser bundle, so anyone
          can decode a link back to its label. Use <Code>kris</Code> or a last-4 like{' '}
          <Code>kris-3333</Code>. Never encode a full phone number or email.
        </TextSm>
      </Box>
    </Stack>
  )
}
