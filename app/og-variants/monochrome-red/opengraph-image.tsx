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
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: '#dc2626',
        padding: 28,
      }}
    >
      {/* White card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          borderRadius: 8,
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Left: text content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: 56,
            justifyContent: 'space-between',
          }}
        >
          {/* Top section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Eyebrow */}
            <div
              style={{
                display: 'flex',
                fontSize: 16,
                fontWeight: 700,
                color: '#dc2626',
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}
            >
              {EYEBROW}
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                fontSize: 68,
                fontWeight: 900,
                color: '#7b0000',
                lineHeight: 1.05,
                letterSpacing: -1,
              }}
            >
              {TITLE}
            </div>

            {/* Body */}
            <div
              style={{
                display: 'flex',
                fontSize: 20,
                color: '#444444',
                lineHeight: 1.55,
                maxWidth: 580,
              }}
            >
              {BODY}
            </div>
          </div>

          {/* Bottom section: pills + domain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Duration pills */}
            <div style={{ display: 'flex', gap: 12 }}>
              {DURATIONS.map((d) => (
                <div
                  key={d}
                  style={{
                    display: 'flex',
                    paddingTop: 8,
                    paddingBottom: 8,
                    paddingLeft: 22,
                    paddingRight: 22,
                    border: '2px solid #dc2626',
                    borderRadius: 100,
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#dc2626',
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
                fontSize: 15,
                color: '#dc2626',
                letterSpacing: 2,
                textTransform: 'lowercase',
                fontWeight: 600,
                opacity: 0.7,
              }}
            >
              {DOMAIN}
            </div>
          </div>
        </div>

        {/* Right: ghost photo */}
        <div
          style={{
            width: 380,
            height: 574,
            display: 'flex',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Photo */}
          <img
            src={tableImg}
            width={380}
            height={574}
            alt=""
            aria-hidden="true"
            style={{ display: 'flex', objectFit: 'cover' }}
          />
          {/* Red overlay — ghost effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 380,
              height: 574,
              display: 'flex',
              backgroundColor: 'rgba(220,38,38,0.65)',
            }}
          />
        </div>
      </div>
    </div>,
    { ...size }
  )
}
