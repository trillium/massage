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
          background: '#0a0a0a',
        }}
      >
        {/* Gold hairline border inset */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: '2px solid #c9a84c',
            display: 'flex',
            pointerEvents: 'none',
          }}
        />

        {/* Left content panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 72,
            paddingRight: 56,
            paddingTop: 60,
            paddingBottom: 60,
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 32,
                height: 1,
                background: '#c9a84c',
                marginRight: 14,
                display: 'flex',
              }}
            />
            <span
              style={{
                fontSize: 14,
                letterSpacing: 4,
                color: '#c9a84c',
                fontFamily: 'sans-serif',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {EYEBROW}
            </span>
            <div
              style={{
                width: 32,
                height: 1,
                background: '#c9a84c',
                marginLeft: 14,
                display: 'flex',
              }}
            />
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              color: '#ffffff',
              fontFamily: 'serif',
              lineHeight: 1.0,
              marginBottom: 28,
              display: 'flex',
            }}
          >
            {TITLE}
          </div>

          {/* Thin gold rule */}
          <div
            style={{
              width: 64,
              height: 1,
              background: '#c9a84c',
              marginBottom: 28,
              display: 'flex',
            }}
          />

          {/* Body */}
          <div
            style={{
              fontSize: 28,
              color: '#a89060',
              fontFamily: 'sans-serif',
              lineHeight: 1.5,
              marginBottom: 44,
              display: 'flex',
            }}
          >
            {BODY}
          </div>

          {/* Duration pills */}
          <div
            style={{
              display: 'flex',
              gap: 14,
            }}
          >
            {DURATIONS.map(d => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #c9a84c',
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 24,
                  paddingRight: 24,
                  color: '#c9a84c',
                  fontSize: 16,
                  letterSpacing: 2,
                  fontFamily: 'sans-serif',
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Photo — right side, no overlay */}
        <div style={{ width: 380, height: 630, display: 'flex', flexShrink: 0 }}>
          <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
        </div>

        {/* Domain — bottom-right, inside border */}
        <div
          style={{
            position: 'absolute',
            bottom: 38,
            right: 42,
            fontSize: 18,
            color: '#7a6535',
            fontFamily: 'sans-serif',
            letterSpacing: 1,
            display: 'flex',
          }}
        >
          {DOMAIN}
        </div>
      </div>
    ),
    { ...size }
  )
}
