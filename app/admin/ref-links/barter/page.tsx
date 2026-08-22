'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CustomLink from '@/components/Link'
import { siteConfig } from '@/lib/siteConfig'
import { barterTag, buildBarterUrl, barterSmsHref } from '@/lib/ref/barter'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { H2 } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TextSm, TextSmMuted, TextXs } from '@/components/ui/text'
import { Code } from '@/components/ui/code'

const BASE_URL = siteConfig.domain.siteUrl.replace(/\/$/, '')
const SHOW_STORAGE_KEY = 'barter-show'

function readStoredShow(): string {
  try {
    return window.localStorage?.getItem(SHOW_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function storeShow(value: string) {
  try {
    window.localStorage?.setItem(SHOW_STORAGE_KEY, value)
  } catch {}
}

interface MintedLink {
  tag: string
  url: string
  smsHref: string
}

export default function BarterLinksPage() {
  const [show, setShow] = useState('')
  const [client, setClient] = useState('')
  const [minted, setMinted] = useState<MintedLink | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setShow(readStoredShow())
    setCanShare(typeof navigator.share === 'function')
  }, [])

  function mint() {
    setCopied(false)
    try {
      const url = buildBarterUrl(show, client, BASE_URL)
      storeShow(show)
      setMinted({ tag: barterTag(show, client), url, smsHref: barterSmsHref(url) })
      setError(null)
    } catch (e) {
      setMinted(null)
      setError(
        e instanceof Error && e.message.startsWith('barterTag: ')
          ? `${e.message
              .slice('barterTag: '.length)
              .replace(/^./, (first) => first.toUpperCase())}.`
          : 'NEXT_PUBLIC_REF_CODE_SECRET is not set — cannot mint codes.'
      )
    }
  }

  async function copy() {
    if (!minted) return
    await navigator.clipboard.writeText(minted.url)
    setCopied(true)
  }

  async function share() {
    if (!minted) return
    await navigator.share({ url: minted.url }).catch(() => undefined)
  }

  return (
    <Stack direction="col" gap={6} className="mx-auto max-w-md">
      <Box>
        <H2 className="dark:text-white">Barter link</H2>
        <TextSmMuted>
          Mint a link unique to the person in front of you, then text it. Lands on{' '}
          <Code>/barter</Code> with attribution baked in.{' '}
          <Link href="/admin/ref-links" className="underline">
            Plain ref links →
          </Link>
        </TextSmMuted>
      </Box>

      <Box className="rounded-lg bg-surface-50 p-4 shadow-md dark:bg-surface-800">
        <Stack direction="col" gap={4}>
          <Input
            id="barter-show"
            label="Show / event (remembered on this phone)"
            placeholder="scale23x"
            value={show}
            onChange={(e) => setShow(e.target.value)}
          />
          <Input
            id="barter-client"
            label="Client (first name or handle — never a phone number)"
            placeholder="dj-beard"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && mint()}
            error={error ?? undefined}
          />
          <Button onClick={mint} size="lg" className="w-full">
            Mint link
          </Button>

          {minted && (
            <Box className="rounded-md border border-accent-300 bg-surface-100 p-4 dark:border-accent-600 dark:bg-surface-700">
              <Stack direction="col" gap={3}>
                <TextXs>{minted.tag}</TextXs>
                <Box className="break-all font-mono text-sm text-accent-900 dark:text-accent-100">
                  {minted.url}
                </Box>
                <CustomLink
                  href={minted.smsHref}
                  classes="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary-600 px-6 text-base font-medium text-white transition-colors hover:bg-primary-700"
                >
                  Text it
                </CustomLink>
                <Stack direction="row" gap={2}>
                  <Button variant="outline" onClick={copy} className="flex-1">
                    {copied ? 'Copied ✓' : 'Copy'}
                  </Button>
                  {canShare && (
                    <Button variant="outline" onClick={share} className="flex-1">
                      Share
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>

      <Box className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20">
        <TextSm>
          Labels are decodable by anyone with the link — use a first name or handle, never a phone
          number or email.
        </TextSm>
      </Box>
    </Stack>
  )
}
