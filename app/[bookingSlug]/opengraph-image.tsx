/* ds-ignore-file */
import React from 'react'
import { ImageResponse } from 'next/og'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import siteMetadata from '@/data/siteMetadata'
import type { OgImageData } from './designs/types'
import { render as renderVintagePostcard } from './designs/vintage-postcard'
import { render as renderAiFrom2089 } from './designs/ai-from-2089'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
export const alt = 'Trillium Massage — Book a session'

const ACCENT = '#dc2626'
const GOLD = '#f59e0b'
const TITLE_FALLBACK = 'Book a massage'
const TEXT_TRUNCATE_LIMIT = 160

const DESIGNS: Record<string, (data: OgImageData) => React.JSX.Element> = {
  'vintage-postcard': renderVintagePostcard,
  'ai-from-2089': renderAiFrom2089,
}
const DEFAULT_DESIGN = 'vintage-postcard'

async function tableImageDataUrl(baseUrl: string): Promise<string> {
  const url = `${baseUrl.replace(/\/$/, '')}/static/images/table/table_square_02.jpg`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OGImageBot/1.0)', Accept: 'image/*' },
    cache: 'force-cache',
  })
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const b64 = Buffer.from(await res.arrayBuffer()).toString('base64')
  return `data:${contentType};base64,${b64}`
}

function firstLineOfText(text: string | string[] | null): string {
  if (!text) return ''
  if (Array.isArray(text)) return text[0] ?? ''
  return text
}

function truncate(input: string, limit: number): string {
  if (input.length <= limit) return input
  return `${input.slice(0, limit - 1).trimEnd()}…`
}

function formatDiscountLabel(
  discount: { type: 'percent' | 'dollar'; amountDollars?: number; amountPercent?: number } | null
): string | null {
  if (!discount) return null
  if (discount.type === 'percent') {
    const pct = discount.amountPercent ?? 0
    if (pct >= 1) return 'Free'
    if (pct <= 0) return null
    return `${Math.round(pct * 100)}% off`
  }
  const dollars = discount.amountDollars ?? 0
  if (dollars <= 0) return null
  return `$${dollars} off`
}

function deriveDomainLabel(siteUrl: string): string {
  try {
    return new URL(siteUrl).host.replace(/^www\./, '')
  } catch {
    return siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}

function isGiftSlug(slug: string, title: string): boolean {
  const s = slug.toLowerCase()
  const t = title.toLowerCase()
  return (
    s.includes('birthday') ||
    s.includes('gift') ||
    t.includes('happy birthday') ||
    t.includes('gift')
  )
}

function deriveEyebrow(slug: string, title: string): string {
  const s = slug.toLowerCase()
  const t = title.toLowerCase()
  if (s.includes('birthday') || t.includes('birthday')) return 'BIRTHDAY GIFT'
  if (s.includes('gift') || t.includes('gift')) return 'GIFT'
  if (
    s.includes('event') ||
    s.includes('nerdstage') ||
    s.includes('scale') ||
    s.includes('openclaw')
  )
    return 'EVENT MASSAGE'
  if (s.includes('hotel') || s.includes('kinn')) return 'IN-ROOM MASSAGE'
  if (s.includes('free') || s.includes('barter')) return 'COMPLIMENTARY'
  return 'MOBILE MASSAGE'
}

export default async function Image({ params }: { params: Promise<{ bookingSlug: string }> }) {
  const { bookingSlug } = await params

  let title = TITLE_FALLBACK
  let bodyText = ''
  let durations: number[] = []
  let discountLabel: string | null = null
  let ogDesign = DEFAULT_DESIGN

  try {
    const configMap = await fetchSlugConfigurationData()
    const config = configMap[bookingSlug]
    if (config) {
      title = config.title ?? TITLE_FALLBACK
      bodyText = truncate(firstLineOfText(config.text), TEXT_TRUNCATE_LIMIT)
      durations = Array.isArray(config.allowedDurations) ? config.allowedDurations.slice(0, 3) : []
      discountLabel = formatDiscountLabel(config.discount)
      if (config.ogDesign && config.ogDesign in DESIGNS) ogDesign = config.ogDesign
    }
  } catch {
    title = TITLE_FALLBACK
  }

  const giftMode = isGiftSlug(bookingSlug, title)
  const accentColor = giftMode ? GOLD : ACCENT
  const data: OgImageData = {
    title,
    bodyText,
    durations,
    discountLabel,
    domainLabel: deriveDomainLabel(siteMetadata.siteUrl),
    eyebrow: deriveEyebrow(bookingSlug, title),
    giftMode,
    accentColor,
    tableImageSrc: await tableImageDataUrl(siteMetadata.siteUrl),
  }

  const renderFn = DESIGNS[ogDesign] ?? DESIGNS[DEFAULT_DESIGN]
  return new ImageResponse(renderFn(data), { ...size })
}
