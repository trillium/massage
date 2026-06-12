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
          background: '#010d1a',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Deep background gradient — pressure from above */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, #010d1a 0%, #010d1a 60%, #00080f 100%)',
          }}
        />

        {/* Faint radial glow from lower-left — bioluminescent bloom */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: -120,
            bottom: -80,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(0,229,200,0.07) 0%, rgba(0,229,200,0) 70%)',
          }}
        />

        {/* Secondary glow behind photo panel */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: 60,
            top: -60,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(0,100,200,0.08) 0%, rgba(0,100,200,0) 70%)',
          }}
        />

        {/* LEFT CONTENT PANEL */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingLeft: 64,
            paddingRight: 48,
            paddingTop: 56,
            paddingBottom: 56,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Eyebrow — bioluminescent teal */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            {/* Small accent line */}
            <div
              style={{
                display: 'flex',
                width: 28,
                height: 2,
                background: '#00e5c8',
                opacity: 0.9,
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 4,
                color: '#00e5c8',
                textTransform: 'uppercase',
              }}
            >
              {EYEBROW}
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: 70,
              fontWeight: 800,
              color: '#ddeeff',
              lineHeight: 1.08,
              letterSpacing: -1,
              marginBottom: 24,
            }}
          >
            {TITLE}
          </div>

          {/* Body */}
          <div
            style={{
              display: 'flex',
              fontSize: 19,
              color: '#448888',
              lineHeight: 1.55,
              maxWidth: 560,
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
              marginBottom: 48,
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
                  border: '1px solid #00e5c8',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#00e5c8',
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
              fontSize: 14,
              color: '#224444',
              letterSpacing: 2,
            }}
          >
            {DOMAIN}
          </div>
        </div>

        {/* RIGHT PHOTO PANEL */}
        <div
          style={{
            display: 'flex',
            width: 380,
            height: 630,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* The image — a shape in the abyss */}
          <img
            src={tableImg}
            width={380}
            height={630}
            alt=""
            aria-hidden="true"
            style={{ display: 'flex', objectFit: 'cover' }}
          />

          {/* Deep blue overlay — the table barely visible */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,20,60,0.6)',
            }}
          />

          {/* Left edge gradient — photo fades into bg */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 80,
              height: '100%',
              background: 'linear-gradient(90deg, #010d1a 0%, rgba(1,13,26,0) 100%)',
            }}
          />

          {/* Bioluminescent dots — scattered near photo panel edges */}
          {/* Top-left cluster */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 48,
              left: 24,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00e5c8',
              opacity: 0.55,
            }}
          />
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 72,
              left: 44,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00e5c8',
              opacity: 0.25,
            }}
          />
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 38,
              left: 60,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00e5c8',
              opacity: 0.4,
            }}
          />

          {/* Right edge cluster */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 200,
              right: 18,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00e5c8',
              opacity: 0.6,
            }}
          />
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 230,
              right: 36,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00e5c8',
              opacity: 0.3,
            }}
          />

          {/* Bottom cluster */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 60,
              left: 30,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00e5c8',
              opacity: 0.45,
            }}
          />
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 90,
              left: 55,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00e5c8',
              opacity: 0.2,
            }}
          />
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 50,
              right: 28,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00e5c8',
              opacity: 0.5,
            }}
          />
        </div>

        {/* Thin teal top border — like a pressure line */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, rgba(0,229,200,0) 0%, rgba(0,229,200,0.5) 40%, rgba(0,229,200,0.15) 100%)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
