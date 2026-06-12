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
  const buf = await sharp(
    join(process.cwd(), 'public/static/images/table/table_square_02.webp')
  )
    .resize(380, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 90 })
    .toBuffer()
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

function Diamond({ x }: { x: number }) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        left: x,
        top: 0,
        width: 14,
        height: 14,
        background: '#f59e0b',
        transform: 'rotate(45deg)',
      }}
    />
  )
}

export default async function Image() {
  const tableImg = await loadTableImage()

  const diamondPositions = [0, 22, 44, 66, 88]

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        {/* Photo panel — left */}
        <img
          src={tableImg}
          width={380}
          height={630}
          alt=""
          aria-hidden="true"
          style={{ objectFit: 'cover', flexShrink: 0 }}
        />

        {/* Review card panel — right */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            background: '#fafaf5',
            flexDirection: 'column',
            padding: '52px 56px 44px 56px',
            justifyContent: 'space-between',
          }}
        >
          {/* Top section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Star row with diamonds */}
            <div
              style={{
                display: 'flex',
                position: 'relative',
                width: 102,
                height: 14,
                marginBottom: 24,
              }}
            >
              {diamondPositions.map((x, i) => (
                <Diamond key={i} x={x} />
              ))}
            </div>

            {/* Verified eyebrow */}
            <div
              style={{
                display: 'flex',
                fontSize: 13,
                fontWeight: 700,
                color: '#27ae60',
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 18,
              }}
            >
              VERIFIED BIRTHDAY — 5 STARS
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                fontSize: 62,
                fontWeight: 800,
                color: '#1a1a1a',
                lineHeight: 1.1,
                marginBottom: 28,
              }}
            >
              {TITLE}
            </div>

            {/* Thin rule */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: 1,
                background: '#d4d0c8',
                marginBottom: 24,
              }}
            />

            {/* Body text */}
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                color: '#555555',
                lineHeight: 1.55,
              }}
            >
              {BODY}
            </div>
          </div>

          {/* Bottom section: duration badges + domain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Duration pills */}
            <div style={{ display: 'flex', gap: 12 }}>
              {DURATIONS.map((d) => (
                <div
                  key={d}
                  style={{
                    display: 'flex',
                    background: '#e8f5e9',
                    color: '#1b5e20',
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: 1,
                    padding: '8px 20px',
                    borderRadius: 4,
                    border: '1px solid #a5d6a7',
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
                fontSize: 14,
                color: '#999990',
                letterSpacing: 1,
              }}
            >
              {DOMAIN}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
