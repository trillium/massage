/* ds-ignore-file */
import { ImageResponse } from 'next/og'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import siteMetadata from '@/data/siteMetadata'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
export const alt = 'Trillium Massage — Book a session'

const BG = '#1a1a1a'
const ACCENT = '#dc2626'
const GOLD = '#f59e0b'
const TEXT = '#ffffff'
const MUTED = '#a3a3a3'

const TITLE_FALLBACK = 'Book a massage'
const TEXT_TRUNCATE_LIMIT = 120

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
    const parsed = new URL(siteUrl)
    return parsed.host.replace(/^www\./, '')
  } catch {
    return siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
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
      durations = Array.isArray(config.allowedDurations) ? config.allowedDurations.slice(0, 5) : []
      discountLabel = formatDiscountLabel(config.discount)
    }
  } catch {
    title = TITLE_FALLBACK
    bodyText = ''
    durations = []
    discountLabel = null
  }

  const domainLabel = deriveDomainLabel(siteMetadata.siteUrl)

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
      <div
        style={{
          width: 8,
          height: '100%',
          background: ACCENT,
          display: 'flex',
        }}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: MUTED,
            letterSpacing: 1,
            fontWeight: 400,
          }}
        >
          {domainLabel}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            {title}
          </div>
          {bodyText ? (
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                fontWeight: 400,
                color: MUTED,
                lineHeight: 1.4,
              }}
            >
              {bodyText}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {durations.map((minutes) => (
            <div
              key={minutes}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: ACCENT,
                color: TEXT,
                fontSize: 26,
                fontWeight: 700,
                padding: '12px 24px',
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
                color: '#1a1a1a',
                fontSize: 26,
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: 999,
              }}
            >
              {discountLabel}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  )
}
