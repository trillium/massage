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

const STARS: { top: number; left: number; size: number; opacity: number }[] = [
  { top: 42, left: 55, size: 2, opacity: 0.9 },
  { top: 110, left: 180, size: 2, opacity: 0.7 },
  { top: 30, left: 320, size: 2, opacity: 0.85 },
  { top: 88, left: 450, size: 2, opacity: 0.6 },
  { top: 155, left: 60, size: 2, opacity: 0.8 },
  { top: 200, left: 270, size: 2, opacity: 0.75 },
  { top: 260, left: 130, size: 2, opacity: 0.65 },
  { top: 310, left: 390, size: 2, opacity: 0.9 },
  { top: 370, left: 50, size: 2, opacity: 0.7 },
  { top: 420, left: 220, size: 2, opacity: 0.85 },
  { top: 480, left: 100, size: 2, opacity: 0.6 },
  { top: 530, left: 340, size: 2, opacity: 0.8 },
  { top: 580, left: 170, size: 2, opacity: 0.75 },
  { top: 60, left: 560, size: 2, opacity: 0.65 },
  { top: 140, left: 640, size: 2, opacity: 0.9 },
  { top: 240, left: 510, size: 2, opacity: 0.7 },
  { top: 460, left: 590, size: 2, opacity: 0.8 },
  { top: 350, left: 680, size: 2, opacity: 0.6 },
  { top: 500, left: 430, size: 2, opacity: 0.85 },
  { top: 590, left: 620, size: 2, opacity: 0.7 },
]

async function loadTableImage(): Promise<string> {
  const buf = await sharp(
    join(process.cwd(), 'public/static/images/table/table_square_02.webp'),
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
          background: '#000008',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Stars scattered across full image */}
        {STARS.map((star, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              position: 'absolute',
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              background: '#ffffff',
              opacity: star.opacity,
            }}
          />
        ))}

        {/* Left panel — text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            padding: '56px 52px 56px 64px',
            position: 'relative',
          }}
        >
          {/* Pale blue planet — upper right of text panel */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 38,
              right: 44,
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: '#1a3a6e',
              border: '2px solid #4a7aae',
            }}
          />

          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              fontSize: 13,
              letterSpacing: 4,
              color: '#88aadd',
              fontWeight: 600,
              marginBottom: 18,
              textTransform: 'uppercase',
            }}
          >
            {EYEBROW}
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: 70,
              fontWeight: 700,
              color: '#f0f0ff',
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: -1,
            }}
          >
            {TITLE}
          </div>

          {/* Body */}
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#7788aa',
              lineHeight: 1.6,
              marginBottom: 36,
              maxWidth: 520,
            }}
          >
            {BODY}
          </div>

          {/* Duration pills */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 12,
              marginBottom: 40,
            }}
          >
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  border: '1px solid #88aadd',
                  borderRadius: 20,
                  paddingTop: 7,
                  paddingBottom: 7,
                  paddingLeft: 18,
                  paddingRight: 18,
                  fontSize: 14,
                  color: '#88aadd',
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
              fontSize: 13,
              color: '#4a6a9a',
              letterSpacing: 2,
              textTransform: 'lowercase',
            }}
          >
            {DOMAIN}
          </div>
        </div>

        {/* Right panel — photo with deep space overlay */}
        <div
          style={{
            display: 'flex',
            position: 'relative',
            width: 380,
            height: 630,
          }}
        >
          <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
          {/* Deep blue space overlay */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 380,
              height: 630,
              background: 'rgba(0,0,40,0.45)',
            }}
          />
          {/* Faint horizontal scan lines for alien transmission feel */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 380,
              height: 630,
              background:
                'linear-gradient(180deg, transparent 0%, rgba(0,20,60,0.12) 50%, transparent 100%)',
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  )
}
