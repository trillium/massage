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

const CONFETTI_COLORS = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94']

const CONFETTI_PIECES = [
  { left: 30, top: 20, rotate: 15, color: '#ff6b6b' },
  { left: 80, top: 10, rotate: 45, color: '#4ecdc4' },
  { left: 160, top: 30, rotate: 0, color: '#ffe66d' },
  { left: 240, top: 15, rotate: 60, color: '#a8e6cf' },
  { left: 340, top: 25, rotate: 30, color: '#ff8b94' },
  { left: 450, top: 10, rotate: 90, color: '#ff6b6b' },
  { left: 560, top: 30, rotate: 45, color: '#4ecdc4' },
  { left: 660, top: 12, rotate: 15, color: '#ffe66d' },
  { left: 20, top: 560, rotate: 30, color: '#4ecdc4' },
  { left: 100, top: 580, rotate: 60, color: '#ff6b6b' },
  { left: 200, top: 570, rotate: 0, color: '#a8e6cf' },
  { left: 310, top: 590, rotate: 45, color: '#ffe66d' },
  { left: 420, top: 575, rotate: 90, color: '#ff8b94' },
  { left: 530, top: 585, rotate: 15, color: '#ff6b6b' },
]

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
          position: 'relative',
          backgroundColor: '#ffffff',
        }}
      >
        {CONFETTI_PIECES.map((piece, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              position: 'absolute',
              left: piece.left,
              top: piece.top,
              width: 10,
              height: 24,
              backgroundColor: piece.color,
              borderRadius: 2,
              transform: `rotate(${piece.rotate}deg)`,
            }}
          />
        ))}

        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 72,
            paddingRight: 48,
            paddingTop: 60,
            paddingBottom: 60,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 20,
              gap: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 32,
                height: 3,
                backgroundColor: '#ff6b6b',
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 3,
                color: '#ff6b6b',
                textTransform: 'uppercase',
              }}
            >
              {EYEBROW}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 800,
              color: '#1a1a1a',
              lineHeight: 1.05,
              marginBottom: 28,
              letterSpacing: -1,
            }}
          >
            {TITLE}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#444444',
              lineHeight: 1.55,
              marginBottom: 36,
              maxWidth: 560,
            }}
          >
            {BODY}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 40,
            }}
          >
            {DURATIONS.map((d, i) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 22,
                  paddingRight: 22,
                  borderRadius: 100,
                  backgroundColor: i === 0 ? '#ff6b6b' : '#4ecdc4',
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 8,
                height: 8,
                borderRadius: 100,
                backgroundColor: '#ffe66d',
                border: '2px solid #1a1a1a',
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: 15,
                color: '#888888',
                letterSpacing: 1,
              }}
            >
              {DOMAIN}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            width: 380,
            height: 630,
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
