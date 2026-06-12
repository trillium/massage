/* ds-ignore-file */
import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import sharp from 'sharp'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import siteMetadata from '@/data/siteMetadata'

async function loadTableImageAsJpeg(): Promise<string> {
  const imagePath = join(process.cwd(), 'public/static/images/table/table_square_02.webp')
  const buf = await sharp(imagePath)
    .resize(380, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 90 })
    .toBuffer()
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
export const alt = 'Trillium Massage — Book a session'

const BG = '#0f0f0f'
const ACCENT = '#dc2626'
const GOLD = '#f59e0b'
const TEXT = '#ffffff'
const MUTED = '#a3a3a3'
const MUTED_DIM = '#525252'

const TITLE_FALLBACK = 'Book a massage'
const TEXT_TRUNCATE_LIMIT = 100

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

  try {
    const configMap = await fetchSlugConfigurationData()
    const config = configMap[bookingSlug]
    if (config) {
      title = config.title ?? TITLE_FALLBACK
      bodyText = truncate(firstLineOfText(config.text), TEXT_TRUNCATE_LIMIT)
      durations = Array.isArray(config.allowedDurations) ? config.allowedDurations.slice(0, 3) : []
      discountLabel = formatDiscountLabel(config.discount)
    }
  } catch {
    title = TITLE_FALLBACK
  }

  const domainLabel = deriveDomainLabel(siteMetadata.siteUrl)
  const giftMode = isGiftSlug(bookingSlug, title)
  const accentColor = giftMode ? GOLD : ACCENT
  const eyebrow = deriveEyebrow(bookingSlug, title)
  const showPills = !giftMode && durations.length > 0
  const tableImageSrc = await loadTableImageAsJpeg()

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: BG,
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Left accent bar */}
      <div style={{ width: 10, height: '100%', background: accentColor, display: 'flex' }} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 72px 48px 64px',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.05,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>
          {bodyText ? (
            <div
              style={{
                display: 'flex',
                fontSize: 32,
                fontWeight: 400,
                color: MUTED,
                lineHeight: 1.35,
              }}
            >
              {bodyText}
            </div>
          ) : null}
        </div>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Pills */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {showPills &&
              durations.map((minutes) => (
                <div
                  key={minutes}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${accentColor}`,
                    color: TEXT,
                    fontSize: 26,
                    fontWeight: 600,
                    padding: '10px 22px',
                    borderRadius: 999,
                  }}
                >
                  {`${minutes} min`}
                </div>
              ))}
            {discountLabel ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: GOLD,
                  color: '#0f0f0f',
                  fontSize: 26,
                  fontWeight: 700,
                  padding: '10px 22px',
                  borderRadius: 999,
                }}
              >
                {discountLabel}
              </div>
            ) : null}
          </div>

          {/* Domain */}
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: MUTED_DIM,
              letterSpacing: 0.5,
            }}
          >
            {domainLabel}
          </div>
        </div>
      </div>

      {/* Right image panel */}
      <div
        style={{
          width: 380,
          height: '100%',
          display: 'flex',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: required for Satori ImageResponse — next/image not supported */}
        <img src={tableImageSrc} width={380} height={630} alt="" aria-hidden="true" />
        {/* Left fade into dark bg */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 140,
            height: '100%',
            background: `linear-gradient(to right, ${BG} 0%, transparent 100%)`,
            display: 'flex',
          }}
        />
        {/* Gift: warm gold tint */}
        {giftMode && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(245,158,11,0.12)',
              display: 'flex',
            }}
          />
        )}
        {/* Gift: horizontal ribbon */}
        {giftMode && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 80,
              width: '100%',
              height: 14,
              background: GOLD,
              display: 'flex',
              opacity: 0.85,
            }}
          />
        )}
        {/* Gift: vertical ribbon */}
        {giftMode && (
          <div
            style={{
              position: 'absolute',
              left: 120,
              top: 0,
              width: 14,
              height: '100%',
              background: GOLD,
              display: 'flex',
              opacity: 0.85,
            }}
          />
        )}
        {/* Gift bow — left ribbon tail */}
        {giftMode && (
          <div
            style={{
              position: 'absolute',
              top: 94,
              left: 121,
              width: 12,
              height: 60,
              background: '#d97706',
              transform: 'rotate(-35deg)',
              transformOrigin: 'top center',
              display: 'flex',
            }}
          />
        )}
        {/* Gift bow — right ribbon tail */}
        {giftMode && (
          <div
            style={{
              position: 'absolute',
              top: 94,
              left: 121,
              width: 12,
              height: 60,
              background: '#d97706',
              transform: 'rotate(35deg)',
              transformOrigin: 'top center',
              display: 'flex',
            }}
          />
        )}
        {/* Gift bow — left loop */}
        {giftMode && (
          <div
            style={{
              position: 'absolute',
              top: 50,
              left: 79,
              width: 48,
              height: 36,
              background: GOLD,
              borderRadius: '50% 8% 50% 8%',
              transform: 'rotate(-25deg)',
              display: 'flex',
            }}
          />
        )}
        {/* Gift bow — right loop */}
        {giftMode && (
          <div
            style={{
              position: 'absolute',
              top: 50,
              left: 127,
              width: 48,
              height: 36,
              background: GOLD,
              borderRadius: '8% 50% 8% 50%',
              transform: 'rotate(25deg)',
              display: 'flex',
            }}
          />
        )}
        {/* Gift bow — knot */}
        {giftMode && (
          <div
            style={{
              position: 'absolute',
              top: 76,
              left: 118,
              width: 18,
              height: 22,
              background: '#d97706',
              borderRadius: 5,
              display: 'flex',
            }}
          />
        )}
      </div>
    </div>,
    { ...size }
  )
}
