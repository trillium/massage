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
          background: '#fdf4ff',
          position: 'relative',
        }}
      >
        {/* Left content area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 48px 60px 64px',
          }}
        >
          {/* Blush card wrapping title + body */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: '#fce4ec',
              borderRadius: 12,
              padding: 32,
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              {/* Decorative line */}
              <div
                style={{
                  display: 'flex',
                  width: 32,
                  height: 2,
                  background: '#9b59b6',
                  marginRight: 12,
                }}
              />
              <span
                style={{
                  display: 'flex',
                  fontSize: 18,
                  color: '#9b59b6',
                  letterSpacing: 3,
                  fontWeight: 600,
                }}
              >
                {EYEBROW}
              </span>
              <div
                style={{
                  display: 'flex',
                  width: 32,
                  height: 2,
                  background: '#9b59b6',
                  marginLeft: 12,
                }}
              />
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                fontSize: 72,
                color: '#3d1c5e',
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              {TITLE}
            </div>

            {/* Body */}
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                color: '#6b3d8a',
                lineHeight: 1.45,
              }}
            >
              {BODY}
            </div>
          </div>

          {/* Duration pills */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 12,
              marginTop: 28,
            }}
          >
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #9b59b6',
                  borderRadius: 24,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 22,
                  paddingRight: 22,
                  fontSize: 20,
                  color: '#3d1c5e',
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Domain footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 32,
              gap: 10,
            }}
          >
            {/* Small flower accent */}
            <div
              style={{
                display: 'flex',
                width: 8,
                height: 8,
                borderRadius: 4,
                background: '#9b59b6',
              }}
            />
            <span
              style={{
                display: 'flex',
                fontSize: 18,
                color: '#9b59b6',
                letterSpacing: 1,
              }}
            >
              {DOMAIN}
            </span>
          </div>
        </div>

        {/* Right photo column */}
        <div
          style={{
            display: 'flex',
            width: 380,
            height: 630,
            position: 'relative',
          }}
        >
          <img
            src={tableImg}
            width={380}
            height={630}
            alt=""
            aria-hidden="true"
          />
          {/* Rose tint overlay */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 380,
              height: 630,
              background: 'rgba(252,228,236,0.25)',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
