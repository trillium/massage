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
        backgroundColor: '#f5f0e8',
        padding: 20,
      }}
    >
      {/* Outer border frame */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          border: '4px solid #2c1810',
          padding: 8,
        }}
      >
        {/* Inner border frame */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            border: '2px solid #2c1810',
            overflow: 'hidden',
          }}
        >
          {/* Left: photo column */}
          <div style={{ display: 'flex', position: 'relative', flexShrink: 0 }}>
            <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
            {/* Warm amber tint overlay */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 380,
                height: 630,
                backgroundColor: 'rgba(180,120,60,0.3)',
              }}
            />
          </div>

          {/* Right: text column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              backgroundColor: '#f5f0e8',
              padding: '40px 44px',
              justifyContent: 'space-between',
            }}
          >
            {/* Top section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* BIRTHDAY eyebrow with flanking rules */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: 60,
                    height: 2,
                    backgroundColor: '#2c1810',
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontVariant: 'small-caps',
                    letterSpacing: 4,
                    color: '#2c1810',
                    textTransform: 'uppercase',
                  }}
                >
                  — BIRTHDAY —
                </span>
                <div
                  style={{
                    display: 'flex',
                    width: 60,
                    height: 2,
                    backgroundColor: '#2c1810',
                  }}
                />
              </div>

              {/* Title */}
              <div
                style={{
                  display: 'flex',
                  fontSize: 72,
                  fontWeight: 'bold',
                  color: '#2c1810',
                  lineHeight: 1.05,
                  marginBottom: 24,
                }}
              >
                {TITLE}
              </div>

              {/* Decorative rule under title */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: 1,
                  backgroundColor: '#2c1810',
                  marginBottom: 22,
                  opacity: 0.4,
                }}
              />

              {/* Body text */}
              <div
                style={{
                  display: 'flex',
                  fontSize: 18,
                  color: '#2c1810',
                  lineHeight: 1.6,
                  opacity: 0.85,
                }}
              >
                {BODY}
              </div>
            </div>

            {/* Middle: duration badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: 12,
                  letterSpacing: 3,
                  color: '#2c1810',
                  textTransform: 'uppercase',
                  opacity: 0.6,
                  marginBottom: 4,
                }}
              >
                Choose your session
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                {DURATIONS.map((d) => (
                  <div
                    key={d}
                    style={{
                      display: 'flex',
                      border: '1px solid #2c1810',
                      padding: '8px 20px',
                      fontSize: 16,
                      letterSpacing: 2,
                      color: '#2c1810',
                      textTransform: 'uppercase',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: domain */}
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: 1,
                  backgroundColor: '#2c1810',
                  opacity: 0.3,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  fontSize: 14,
                  letterSpacing: 3,
                  color: '#2c1810',
                  textTransform: 'uppercase',
                  fontVariant: 'small-caps',
                  opacity: 0.7,
                }}
              >
                {DOMAIN}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    { ...size }
  )
}
