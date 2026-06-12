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
        position: 'relative',
        backgroundColor: '#080010',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Full-width 1px magenta horizontal line at y=315 */}
      <div
        style={{
          position: 'absolute',
          top: 315,
          left: 0,
          width: 1200,
          height: 1,
          backgroundColor: '#ff2d78',
          display: 'flex',
        }}
      />

      {/* Left content area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          padding: '60px 56px 60px 64px',
          position: 'relative',
        }}
      >
        {/* Eyebrow label */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 4,
              color: '#00e5ff',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            {EYEBROW}
          </span>

          {/* Bright magenta line below eyebrow */}
          <div
            style={{
              width: 280,
              height: 3,
              backgroundColor: '#ff2d78',
              display: 'flex',
              marginBottom: 24,
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.05,
            marginBottom: 24,
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {TITLE}
        </div>

        {/* Body text */}
        <div
          style={{
            fontSize: 18,
            color: '#555577',
            lineHeight: 1.6,
            marginBottom: 36,
            display: 'flex',
            maxWidth: 620,
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
            marginBottom: 48,
          }}
        >
          {DURATIONS.map((d) => (
            <div
              key={d}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ff2d78',
                borderRadius: 100,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 20,
                paddingRight: 20,
                color: '#ff2d78',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 1,
                backgroundColor: 'transparent',
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
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#00e5ff',
              display: 'flex',
            }}
          />
          <span
            style={{
              fontSize: 14,
              color: '#00e5ff',
              letterSpacing: 2,
              textTransform: 'lowercase',
            }}
          >
            {DOMAIN}
          </span>
        </div>
      </div>

      {/* Right photo area with purple-teal overlay */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: 380,
          height: 630,
          flexShrink: 0,
        }}
      >
        <img
          src={tableImg}
          width={380}
          height={630}
          alt=""
          aria-hidden="true"
          style={{ display: 'flex', objectFit: 'cover' }}
        />
        {/* Purple-teal overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 380,
            height: 630,
            backgroundColor: 'rgba(80,0,120,0.4)',
            display: 'flex',
          }}
        />
        {/* Gradient fade on left edge of photo to blend with background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 80,
            height: 630,
            background: 'linear-gradient(to right, #080010, transparent)',
            display: 'flex',
          }}
        />
      </div>
    </div>,
    { ...size }
  )
}
