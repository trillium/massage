/* ds-ignore-file */
import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

const TITLE = 'Happy Birthday Rachel!'
const BODY = "I didn't get you a gift but I thought this would suffice. Please enjoy a 60 or 90 minute massage from me at a location of your choosing."
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
          background: '#1a0033',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Scanline grid overlay for 80s feel */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            background:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 4px)',
            zIndex: 1,
          }}
        />

        {/* Left content panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 60,
            paddingRight: 40,
            paddingTop: 60,
            paddingBottom: 40,
            position: 'relative',
            zIndex: 3,
          }}
        >
          {/* Three horizontal stripes near top */}
          <div
            style={{
              position: 'absolute',
              top: 32,
              left: 60,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            <div style={{ display: 'flex', width: 480, height: 4, background: '#ff00aa', marginBottom: 4 }} />
            <div style={{ display: 'flex', width: 480, height: 4, background: '#00ffff', marginBottom: 4 }} />
            <div style={{ display: 'flex', width: 480, height: 4, background: '#ffff00' }} />
          </div>

          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              color: '#00ffff',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: 'uppercase',
              marginBottom: 16,
              marginTop: 40,
            }}
          >
            {EYEBROW}
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              color: '#ff00aa',
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: 24,
              textShadow: '0 0 30px rgba(255,0,170,0.7)',
            }}
          >
            {TITLE}
          </div>

          {/* Body text */}
          <div
            style={{
              display: 'flex',
              color: '#e8d0ff',
              fontSize: 18,
              lineHeight: 1.55,
              marginBottom: 32,
              maxWidth: 480,
            }}
          >
            {BODY}
          </div>

          {/* Duration pills */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12, marginBottom: 36 }}>
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  background: '#ffff00',
                  color: '#1a0033',
                  fontSize: 15,
                  fontWeight: 800,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 4,
                  letterSpacing: 2,
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
              color: '#00ffff',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: 'uppercase',
              borderTop: '1px solid rgba(0,255,255,0.3)',
              paddingTop: 16,
            }}
          >
            {DOMAIN}
          </div>
        </div>

        {/* Photo panel */}
        <div
          style={{
            width: 380,
            height: 630,
            display: 'flex',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />

          {/* Purple overlay on photo */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 380,
              height: 630,
              display: 'flex',
              background: 'rgba(80,0,160,0.4)',
              zIndex: 2,
            }}
          />

          {/* Magenta edge glow on left side of photo */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 3,
              height: 630,
              display: 'flex',
              background: '#ff00aa',
              zIndex: 3,
            }}
          />

          {/* Decorative corner tag */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              zIndex: 4,
            }}
          >
            <div
              style={{
                display: 'flex',
                background: '#ff00aa',
                color: '#1a0033',
                fontSize: 11,
                fontWeight: 900,
                paddingTop: 4,
                paddingBottom: 4,
                paddingLeft: 10,
                paddingRight: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              FOR YOU
            </div>
          </div>
        </div>

        {/* Cyan glow accent bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 260,
            height: 260,
            display: 'flex',
            background: 'rgba(0,255,255,0.08)',
            borderRadius: 130,
            zIndex: 2,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
