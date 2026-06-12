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
          backgroundColor: '#ffffff',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Red strip — leftmost 80px */}
        <div
          style={{
            width: 80,
            height: 630,
            backgroundColor: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              color: '#ffffff',
              fontSize: 14,
              letterSpacing: 3,
              fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              transform: 'rotate(-90deg)',
              whiteSpace: 'nowrap',
            }}
          >
            {EYEBROW}
          </div>
        </div>

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 56px 60px 56px',
          }}
        >
          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 700,
              color: '#000000',
              lineHeight: 1.0,
              fontFamily: 'Georgia, serif',
              marginBottom: 28,
              letterSpacing: -1,
            }}
          >
            {TITLE}
          </div>

          {/* Thin rule */}
          <div
            style={{
              display: 'flex',
              width: 60,
              height: 3,
              backgroundColor: '#dc2626',
              marginBottom: 28,
            }}
          />

          {/* Body */}
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              color: '#444444',
              lineHeight: 1.5,
              fontFamily: 'Georgia, serif',
              marginBottom: 40,
            }}
          >
            {BODY}
          </div>

          {/* Duration pills */}
          <div
            style={{
              display: 'flex',
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
                  border: '2px solid #000000',
                  fontSize: 16,
                  fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                  fontWeight: 600,
                  color: '#000000',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
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
              fontSize: 18,
              color: '#888888',
              fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
              letterSpacing: 2,
              textTransform: 'lowercase',
            }}
          >
            {DOMAIN}
          </div>
        </div>

        {/* Photo — right 380px */}
        <div
          style={{
            width: 380,
            height: 630,
            display: 'flex',
            flexShrink: 0,
          }}
        >
          <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
        </div>
      </div>
    ),
    { ...size }
  )
}
