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
const EYEBROW = 'AS WAS FORETOLD'
const DOMAIN = 'trilliummassage.la'
const DURATIONS = ['60 min', '90 min']

async function loadTableImage(): Promise<string> {
  const buf = await sharp(join(process.cwd(), 'public/static/images/table/table_square_02.webp'))
    .resize(380, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 90 })
    .toBuffer()
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

function GlyphRow({ y, count, seed }: { y: number; count: number; seed: number }) {
  const glyphs = Array.from({ length: count }, (_, i) => {
    const opacity = 0.3 + ((seed * 7 + i * 13) % 50) / 100
    const x = 40 + i * 22
    return (
      <div
        key={i}
        style={{
          display: 'flex',
          position: 'absolute',
          left: x,
          top: y,
          width: 8,
          height: 8,
          background: '#d4af37',
          opacity,
        }}
      />
    )
  })
  return <>{glyphs}</>
}

export default async function Image() {
  const tableImg = await loadTableImage()

  const glyphRows = [
    { y: 60, count: 28, seed: 3 },
    { y: 82, count: 26, seed: 7 },
    { y: 104, count: 30, seed: 11 },
  ]

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#2d2418',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Stone texture grain overlay */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(80,60,30,0.18) 0%, transparent 40%, rgba(20,15,8,0.3) 100%)',
        }}
      />

      {/* Subtle vignette */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 40% 50%, transparent 40%, rgba(10,8,4,0.55) 100%)',
        }}
      />

      {/* Left content area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          paddingLeft: 60,
          paddingRight: 40,
          paddingTop: 40,
          paddingBottom: 40,
          position: 'relative',
        }}
      >
        {/* Glyph rows — ancient script */}
        <div style={{ display: 'flex', position: 'relative', height: 140, marginBottom: 12 }}>
          {glyphRows.map((row, ri) => (
            <GlyphRow key={ri} y={row.y - 60} count={row.count} seed={row.seed} />
          ))}
        </div>

        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 6,
            color: '#d4af37',
            textTransform: 'uppercase',
            marginBottom: 18,
            opacity: 0.85,
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
            color: '#c9a84c',
            lineHeight: 1.1,
            marginBottom: 28,
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          {TITLE}
        </div>

        {/* Body */}
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#c8b88a',
            lineHeight: 1.5,
            marginBottom: 36,
            maxWidth: 560,
            opacity: 0.92,
          }}
        >
          {BODY}
        </div>

        {/* Duration pills */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 36 }}>
          {DURATIONS.map((d) => (
            <div
              key={d}
              style={{
                display: 'flex',
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 24,
                paddingRight: 24,
                border: '1px solid #8b7355',
                color: '#c9a84c',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2,
                background: 'rgba(45,36,24,0.7)',
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
            fontSize: 16,
            color: '#8b7355',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {DOMAIN}
        </div>

        {/* Disputed translation footnote */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 22,
            left: 60,
            fontSize: 11,
            color: '#5a4a32',
            letterSpacing: 1,
            fontStyle: 'italic',
          }}
        >
          * translation disputed
        </div>
      </div>

      {/* Photo — right side */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: 380,
          height: 630,
          flexShrink: 0,
        }}
      >
        <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
        {/* Sepia overlay */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: 0,
            background: 'rgba(160,100,40,0.4)',
          }}
        />
        {/* Edge blend into stone */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(45,36,24,0.6) 0%, transparent 30%)',
          }}
        />
      </div>

      {/* Cracked vertical line */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 820,
          top: 0,
          width: 1,
          height: 630,
          background: '#8b7355',
          opacity: 0.55,
        }}
      />
      {/* Crack branch — upper */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 820,
          top: 180,
          width: 18,
          height: 1,
          background: '#8b7355',
          opacity: 0.35,
          transform: 'rotate(-22deg)',
        }}
      />
      {/* Crack branch — lower */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 820,
          top: 390,
          width: 14,
          height: 1,
          background: '#8b7355',
          opacity: 0.3,
          transform: 'rotate(15deg)',
        }}
      />

      {/* Top border rune line */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            'linear-gradient(to right, transparent, #8b7355 20%, #d4af37 50%, #8b7355 80%, transparent)',
          opacity: 0.6,
        }}
      />

      {/* Bottom border rune line */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            'linear-gradient(to right, transparent, #8b7355 20%, #d4af37 50%, #8b7355 80%, transparent)',
          opacity: 0.6,
        }}
      />
    </div>,
    { ...size }
  )
}
