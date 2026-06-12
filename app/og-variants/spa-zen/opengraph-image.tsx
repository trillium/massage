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
          backgroundColor: '#e8efe8',
          position: 'relative',
        }}
      >
        {/* Left content area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingLeft: 72,
            paddingRight: 60,
            paddingTop: 60,
            paddingBottom: 60,
          }}
        >
          {/* Domain / top label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#1a3a1a',
                marginRight: 10,
              }}
            />
            <span
              style={{
                fontSize: 14,
                color: '#3d6b3d',
                letterSpacing: 2,
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              {DOMAIN}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 700,
              color: '#1a3a1a',
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            {TITLE}
          </div>

          {/* Divider line */}
          <div
            style={{
              display: 'flex',
              width: 180,
              height: 1,
              backgroundColor: '#3d6b3d',
              marginBottom: 28,
            }}
          />

          {/* Body text */}
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              color: '#3d6b3d',
              lineHeight: 1.5,
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
            }}
          >
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  color: '#1a3a1a',
                  border: '1px solid #3d6b3d',
                  borderRadius: 24,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 8,
                  paddingBottom: 8,
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Right photo column */}
        <div
          style={{
            display: 'flex',
            width: 380,
            height: 630,
            position: 'relative',
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
          {/* Green wash overlay */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 380,
              height: 630,
              backgroundColor: 'rgba(56,142,60,0.12)',
            }}
          />
        </div>

        {/* Decorative dot near title — positioned absolute, rendered last (top z) */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 52,
            left: 660,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#1a3a1a',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
