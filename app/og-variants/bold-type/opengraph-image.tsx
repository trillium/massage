/* ds-ignore-file */ /* content-ok-file */
import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

const TITLE = 'Happy Birthday Rachel!'
const BODY = "I didn't get you a gift but I thought this would suffice. Please enjoy a 60 or 90 minute massage from me at a location of your choosing."
const EYEBROW = 'BIRTHDAY GIFT'
const DOMAIN = 'trilliummassage.la'
const DURATIONS = ['60 min', '90 min']

async function loadTableImage(): Promise<string> {
  const buf = await sharp(join(process.cwd(), 'public/static/images/table/table_square_02.webp'))
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
          background: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Left content panel */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '56px 48px 56px 64px',
            position: 'relative',
          }}
        >
          {/* 4px left red accent bar */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              left: 0,
              top: 0,
              width: 4,
              height: '100%',
              background: '#dc2626',
            }}
          />

          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              fontWeight: 700,
              color: '#dc2626',
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            {EYEBROW}
          </div>

          {/* Hero title — full width, heroic wrapping */}
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 900,
              color: '#000000',
              letterSpacing: -3,
              lineHeight: 0.95,
              marginBottom: 48,
              maxWidth: 660,
            }}
          >
            {TITLE}
          </div>

          {/* Duration pills */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 12,
              marginBottom: 48,
            }}
          >
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #000000',
                  borderRadius: 999,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 20,
                  paddingRight: 20,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#000000',
                  letterSpacing: 0.5,
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
              fontSize: 14,
              color: '#9ca3af',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {DOMAIN}
          </div>
        </div>

        {/* Photo flush right, no overlay */}
        <div style={{ display: 'flex', width: 380, flexShrink: 0 }}>
          <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
        </div>
      </div>
    ),
    { ...size }
  )
}
