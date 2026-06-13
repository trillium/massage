/* ds-ignore-file */
import React from 'react'
import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import sharp from 'sharp'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
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

async function tableImageDataUrl(): Promise<string> {
  const buf = await sharp(join(process.cwd(), 'public/static/images/table/table_square_02.webp'))
    .resize(380, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 90 })
    .toBuffer()
  return `data:image/jpeg;base64,${buf.toString('base64')}`
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

  let tableImageSrc = ''
  try {
    tableImageSrc = await tableImageDataUrl()
  } catch (e) {
    console.error('[og-image] tableImageDataUrl failed:', e)
  }

  const data: OgImageData = {
    title,
    bodyText,
    durations,
    discountLabel,
    domainLabel: 'trilliummassage.la',
    eyebrow: deriveEyebrow(bookingSlug, title),
    giftMode,
    accentColor,
    tableImageSrc,
  }

  const renderFn = DESIGNS[ogDesign] ?? DESIGNS[DEFAULT_DESIGN]
  return new ImageResponse(renderFn(data), { ...size })
}
