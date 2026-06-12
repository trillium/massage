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
          backgroundColor: '#ffffff',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {/* Left: text column */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 48px',
            position: 'relative',
          }}
        >
          {/* Top thick rule */}
          <div
            style={{
              width: '100%',
              height: 4,
              backgroundColor: '#000000',
              display: 'flex',
              marginBottom: 20,
            }}
          />

          {/* Eyebrow: black pill / reverse block */}
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              backgroundColor: '#000000',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: 16,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontWeight: 700,
                letterSpacing: 3,
                padding: '8px 16px',
                display: 'flex',
                textTransform: 'uppercase',
              }}
            >
              {EYEBROW}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: '#000000',
              lineHeight: 0.95,
              display: 'flex',
              flexWrap: 'wrap',
              marginBottom: 24,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {TITLE}
          </div>

          {/* Bottom thick rule */}
          <div
            style={{
              width: '100%',
              height: 4,
              backgroundColor: '#000000',
              display: 'flex',
              marginBottom: 24,
            }}
          />

          {/* Body text */}
          <div
            style={{
              fontSize: 24,
              color: '#333333',
              lineHeight: 1.45,
              display: 'flex',
              flexWrap: 'wrap',
              marginBottom: 32,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {BODY}
          </div>

          {/* Duration pills */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 0,
            }}
          >
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  border: '2px solid #000000',
                  padding: '6px 20px',
                  fontSize: 18,
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: '#000000',
                  textTransform: 'uppercase',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Domain — pinned to bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              left: 48,
              display: 'flex',
              fontSize: 14,
              color: '#000000',
              fontFamily: 'Arial, Helvetica, sans-serif',
              letterSpacing: 1,
            }}
          >
            {DOMAIN}
          </div>
        </div>

        {/* Vertical rule divider */}
        <div
          style={{
            width: 2,
            backgroundColor: '#000000',
            display: 'flex',
            alignSelf: 'stretch',
          }}
        />

        {/* Right: photo column */}
        <div
          style={{
            width: 380,
            height: 630,
            display: 'flex',
            flexShrink: 0,
            overflow: 'hidden',
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
        </div>
      </div>
    ),
    { ...size },
  )
}
