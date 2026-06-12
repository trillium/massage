/* ds-ignore-file */
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

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0f0e0d',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Left content panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '64px 56px',
            position: 'relative',
          }}
        >
          {/* Gold accent line at top */}
          <div
            style={{
              display: 'flex',
              width: 48,
              height: 3,
              background: '#c9a84c',
              marginBottom: 20,
            }}
          />

          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              fontSize: 13,
              fontFamily: 'Georgia, serif',
              letterSpacing: 4,
              color: '#c9a84c',
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            {EYEBROW}
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontFamily: 'Georgia, serif',
              color: '#ffffff',
              fontWeight: 700,
              lineHeight: 1.05,
              marginBottom: 28,
              letterSpacing: -1,
            }}
          >
            {TITLE}
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              width: 280,
              height: 1,
              background: 'rgba(201,168,76,0.3)',
              marginBottom: 28,
            }}
          />

          {/* Body text */}
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              fontFamily: 'Georgia, serif',
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.6,
              maxWidth: 520,
              marginBottom: 40,
            }}
          >
            {BODY}
          </div>

          {/* Duration pills */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {DURATIONS.map((d, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: i === 0 ? 9 : 8,
                  paddingBottom: 8,
                  border: '2px solid #c9a84c',
                  borderRadius: 32,
                  fontSize: 14,
                  fontFamily: 'Georgia, serif',
                  color: '#c9a84c',
                  letterSpacing: 1,
                  fontWeight: 600,
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
              position: 'absolute',
              bottom: 40,
              left: 56,
              fontSize: 13,
              fontFamily: 'Georgia, serif',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 1,
            }}
          >
            {DOMAIN}
          </div>
        </div>

        {/* Right photo panel */}
        <div
          style={{
            width: 380,
            height: 630,
            display: 'flex',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Photo overlay gradient — fades left edge into dark bg */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              left: 0,
              top: 0,
              width: 120,
              height: 630,
              background: 'linear-gradient(to right, #0f0e0d 0%, transparent 100%)',
              zIndex: 1,
            }}
          />

          {/* Gold border on right edge */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              right: 0,
              top: 0,
              width: 3,
              height: 630,
              background: '#c9a84c',
              zIndex: 2,
            }}
          />

          {/* Photo */}
          <img
            src={tableImg}
            width={380}
            height={630}
            alt=""
            aria-hidden="true"
            style={{ objectFit: 'cover', display: 'flex' }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
