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

export default async function Image() {
  const tableImg = await loadTableImage()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#fffdf5',
          position: 'relative',
        }}
      >
        {/* Triple border: outermost 6px solid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            border: '6px solid #8b6914',
          }}
        />
        {/* Gap layer (inner padding creates gap) */}
        <div
          style={{
            position: 'absolute',
            inset: 14,
            display: 'flex',
            border: '2px dashed #8b6914',
          }}
        />

        {/* Corner ornaments — 12px solid squares */}
        {/* Top-left */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            width: 12,
            height: 12,
            background: '#8b6914',
            display: 'flex',
          }}
        />
        {/* Top-right */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 12,
            height: 12,
            background: '#8b6914',
            display: 'flex',
          }}
        />
        {/* Bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            width: 12,
            height: 12,
            background: '#8b6914',
            display: 'flex',
          }}
        />
        {/* Bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            width: 12,
            height: 12,
            background: '#8b6914',
            display: 'flex',
          }}
        />

        {/* Photo on right with fade overlay */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 380,
            height: 630,
            display: 'flex',
          }}
        >
          <img
            src={tableImg}
            width={380}
            height={630}
            alt=""
            aria-hidden="true"
            style={{ objectFit: 'cover' }}
          />
          {/* Fade overlay rgba(255,253,245,0.5) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,253,245,0.5)',
              display: 'flex',
            }}
          />
        </div>

        {/* Left content panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 820,
            height: '100%',
            paddingLeft: 60,
            paddingRight: 60,
            paddingTop: 40,
            paddingBottom: 80,
          }}
        >
          {/* Eyebrow italic text */}
          <div
            style={{
              fontSize: 22,
              color: '#8b6914',
              fontStyle: 'italic',
              marginBottom: 20,
              letterSpacing: 0.5,
              display: 'flex',
            }}
          >
            This certifies the gift of a massage
          </div>

          {/* Decorative line */}
          <div
            style={{
              width: 320,
              height: 1,
              background: '#8b6914',
              marginBottom: 24,
              display: 'flex',
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: '#2c1a00',
              textAlign: 'center',
              lineHeight: 1.1,
              marginBottom: 28,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {TITLE}
          </div>

          {/* Decorative line */}
          <div
            style={{
              width: 320,
              height: 1,
              background: '#8b6914',
              marginBottom: 28,
              display: 'flex',
            }}
          />

          {/* Body text */}
          <div
            style={{
              fontSize: 18,
              color: '#4a3000',
              textAlign: 'center',
              lineHeight: 1.6,
              maxWidth: 580,
              marginBottom: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {BODY}
          </div>

          {/* Duration badges */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 8,
            }}
          >
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #8b6914',
                  color: '#8b6914',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 8,
                  paddingBottom: 8,
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Gold circle bottom-center with domain text */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: 380,
            right: 380,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid #8b6914',
              background: '#fffdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: '#8b6914',
                fontWeight: 700,
                textAlign: 'center',
                display: 'flex',
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
