/* ds-ignore-file */ /* content-ok-file */
import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

const TITLE = 'Happy Birthday Rachel!'
const BODY =
  "I didn't get you a gift but I thought this would suffice. Please enjoy a 60 or 90 minute massage from me at a location of your choosing."
const EYEBROW = 'BIRTHDAY GIFT'
const DOMAIN = 'trilliummassage.la'
const DURATIONS = ['60 min', '90 min']

const STRIPE_COLORS = ['#dc2626', '#f59e0b']

function buildStripes() {
  return Array.from({ length: 14 }, (_, i) => ({
    color: STRIPE_COLORS[i % 2],
    height: 45,
  }))
}

async function loadTableImage(): Promise<string> {
  const buf = await sharp(
    join(process.cwd(), 'public/static/images/table/table_square_02.webp')
  )
    .resize(380, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 90 })
    .toBuffer()
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

export default async function Image() {
  const tableImg = await loadTableImage()
  const stripes = buildStripes()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#0d0d0d',
          position: 'relative',
        }}
      >
        {/* Left stripe column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 28,
            height: 630,
            flexShrink: 0,
          }}
        >
          {stripes.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                width: 28,
                height: s.height,
                backgroundColor: s.color,
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Main content area */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'stretch',
          }}
        >
          {/* Text panel */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft: 56,
              paddingRight: 40,
              paddingTop: 48,
              paddingBottom: 48,
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: 'flex',
                color: '#f59e0b',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              {EYEBROW}
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                color: '#ffffff',
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.05,
                marginBottom: 28,
              }}
            >
              {TITLE}
            </div>

            {/* Body */}
            <div
              style={{
                display: 'flex',
                color: '#888888',
                fontSize: 20,
                lineHeight: 1.55,
                marginBottom: 40,
                maxWidth: 520,
              }}
            >
              {BODY}
            </div>

            {/* Duration pills */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 12,
                marginBottom: 40,
              }}
            >
              {DURATIONS.map((d) => (
                <div
                  key={d}
                  style={{
                    display: 'flex',
                    paddingTop: 8,
                    paddingBottom: 8,
                    paddingLeft: 20,
                    paddingRight: 20,
                    border: '1px solid #f59e0b',
                    color: '#f59e0b',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Domain */}
            <div
              style={{
                display: 'flex',
                color: '#444444',
                fontSize: 13,
                letterSpacing: 1,
              }}
            >
              {DOMAIN}
            </div>
          </div>

          {/* Photo panel */}
          <div
            style={{
              display: 'flex',
              width: 380,
              height: 630,
              flexShrink: 0,
            }}
          >
            <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
          </div>
        </div>

        {/* Right stripe column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 28,
            height: 630,
            flexShrink: 0,
          }}
        >
          {stripes.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                width: 28,
                height: s.height,
                backgroundColor: s.color,
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
