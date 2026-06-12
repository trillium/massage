/* ds-ignore-file */
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
          flexDirection: 'row',
          background: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* LEFT: photo panel */}
        <div style={{ display: 'flex', width: 380, height: 630, flexShrink: 0, position: 'relative' }}>
          <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
        </div>

        {/* RIGHT: content panel */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            padding: '40px 48px',
            position: 'relative',
            background: '#ffffff',
          }}
        >
          {/* GOLD STAR SHAPE — layered behind content (placed first = behind) */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 28,
              right: 44,
              width: 64,
              height: 64,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Rotated square (diamond) behind circle */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                width: 46,
                height: 46,
                background: '#FFD700',
                transform: 'rotate(45deg)',
              }}
            />
            {/* Circle on top */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                width: 40,
                height: 40,
                borderRadius: 20,
                background: '#FFD700',
              }}
            />
          </div>

          {/* STARBURST — 8 thin rectangles rotated from center */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 44,
              right: 48,
              width: 48,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {[0, 22, 45, 67, 90, 112, 135, 157].map((deg) => (
              <div
                key={deg}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  width: 44,
                  height: 2,
                  background: '#FFD700',
                  transform: `rotate(${deg}deg)`,
                }}
              />
            ))}
            {/* Center dot */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                width: 8,
                height: 8,
                borderRadius: 4,
                background: '#FFD700',
              }}
            />
          </div>

          {/* EYEBROW */}
          <div
            style={{
              display: 'flex',
              color: '#6a0dad',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            {EYEBROW}
          </div>

          {/* TITLE with drop shadow simulation */}
          <div
            style={{
              display: 'flex',
              position: 'relative',
              marginBottom: 24,
            }}
          >
            {/* Shadow duplicate */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 4,
                left: 4,
                fontSize: 76,
                fontWeight: 900,
                color: '#444444',
                lineHeight: 1,
                whiteSpace: 'pre-wrap',
              }}
            >
              {TITLE}
            </div>
            {/* Real title */}
            <div
              style={{
                display: 'flex',
                position: 'relative',
                fontSize: 76,
                fontWeight: 900,
                color: '#000000',
                lineHeight: 1,
                whiteSpace: 'pre-wrap',
              }}
            >
              {TITLE}
            </div>
          </div>

          {/* BODY TEXT */}
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#333333',
              lineHeight: 1.5,
              marginBottom: 28,
              maxWidth: 580,
            }}
          >
            {BODY}
          </div>

          {/* DURATION PILLS */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 14,
              marginBottom: 28,
            }}
          >
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 22,
                  paddingRight: 22,
                  borderRadius: 999,
                  border: '2px solid #6a0dad',
                  color: '#6a0dad',
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* DOMAIN */}
          <div
            style={{
              display: 'flex',
              fontSize: 16,
              color: '#888888',
              fontStyle: 'italic',
              marginTop: 'auto',
            }}
          >
            {DOMAIN}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
