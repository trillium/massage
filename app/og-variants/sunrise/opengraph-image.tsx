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
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
        {/* Background: top half warm dark red */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '50%',
            background: '#3d0f00',
            display: 'flex',
          }}
        />
        {/* Background: bottom half even darker */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: '50%',
            background: '#1a0500',
            display: 'flex',
          }}
        />
        {/* Gold horizon line */}
        <div
          style={{
            position: 'absolute',
            top: 313,
            left: 0,
            width: '100%',
            height: 2,
            background: '#f59e0b',
            display: 'flex',
          }}
        />

        {/* Left content column */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 820,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 72px',
          }}
        >
          {/* Eyebrow — above the gold line, in the top half */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              top: 170,
              left: 72,
            }}
          >
            {/* Eyebrow label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 2,
                  background: '#f59e0b',
                  display: 'flex',
                  marginRight: 12,
                }}
              />
              <span
                style={{
                  color: '#f59e0b',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 4,
                  display: 'flex',
                }}
              >
                {EYEBROW}
              </span>
            </div>

            {/* Title — crosses the gold line into darker zone */}
            <div
              style={{
                display: 'flex',
                fontSize: 76,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.05,
                maxWidth: 680,
              }}
            >
              {TITLE}
            </div>
          </div>

          {/* Body text — in the bottom darker zone */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 380,
              left: 72,
              maxWidth: 620,
              fontSize: 20,
              color: '#a07060',
              lineHeight: 1.6,
            }}
          >
            {BODY}
          </div>

          {/* Duration pills + domain — bottom strip */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 52,
              left: 72,
              alignItems: 'center',
              gap: 12,
            }}
          >
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  border: '2px solid #ffffff',
                  borderRadius: 100,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 20,
                  paddingRight: 20,
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                {d}
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                width: 1,
                height: 22,
                background: '#5a2a1a',
                marginLeft: 8,
                marginRight: 8,
              }}
            />
            <span
              style={{
                display: 'flex',
                color: '#7a3a20',
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              {DOMAIN}
            </span>
          </div>
        </div>

        {/* Photo panel — right side */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 380,
            height: 630,
            display: 'flex',
          }}
        >
          <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
          {/* Warm red overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 380,
              height: 630,
              background: 'rgba(180,40,0,0.2)',
              display: 'flex',
            }}
          />
          {/* Left edge gradient fade into background */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 80,
              height: 630,
              background: 'linear-gradient(to right, #3d0f00, transparent)',
              display: 'flex',
            }}
          />
          {/* Bottom half left fade into darker bg */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 80,
              height: 315,
              background: 'linear-gradient(to right, #1a0500, transparent)',
              display: 'flex',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
