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

const GOLD = '#d4af37'
const BG = '#1a1400'
const BODY_COLOR = '#a89060'

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
          backgroundColor: BG,
          position: 'relative',
        }}
      >
        {/* Left content panel */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 56px',
            position: 'relative',
          }}
        >
          {/* Corner bracket — top-left */}
          <div style={{ display: 'flex', position: 'absolute', top: 28, left: 28 }}>
            {/* horizontal bar */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 50,
                height: 2,
                backgroundColor: GOLD,
              }}
            />
            {/* vertical bar */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 2,
                height: 50,
                backgroundColor: GOLD,
              }}
            />
          </div>

          {/* Corner bracket — bottom-left */}
          <div style={{ display: 'flex', position: 'absolute', bottom: 28, left: 28 }}>
            {/* horizontal bar */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: 50,
                height: 2,
                backgroundColor: GOLD,
              }}
            />
            {/* vertical bar */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: 2,
                height: 50,
                backgroundColor: GOLD,
              }}
            />
          </div>

          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              color: GOLD,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            {EYEBROW}
          </div>

          {/* Diamond motif between eyebrow and title */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 12,
                height: 12,
                backgroundColor: GOLD,
                transform: 'rotate(45deg)',
              }}
            />
            <div
              style={{
                display: 'flex',
                flex: 1,
                height: 1,
                backgroundColor: GOLD,
                marginLeft: 12,
                opacity: 0.4,
              }}
            />
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              color: GOLD,
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 28,
            }}
          >
            {TITLE}
          </div>

          {/* Thin gold rule */}
          <div
            style={{
              display: 'flex',
              width: 60,
              height: 2,
              backgroundColor: GOLD,
              marginBottom: 24,
              opacity: 0.6,
            }}
          />

          {/* Body */}
          <div
            style={{
              display: 'flex',
              color: BODY_COLOR,
              fontSize: 20,
              lineHeight: 1.55,
              marginBottom: 36,
              maxWidth: 540,
            }}
          >
            {BODY}
          </div>

          {/* Duration pills */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 0 }}>
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 22,
                  paddingRight: 22,
                  border: `1px solid ${GOLD}`,
                  color: GOLD,
                  fontSize: 15,
                  letterSpacing: 3,
                  fontWeight: 600,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Domain — bottom-right of left panel */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 38,
              right: 40,
              color: GOLD,
              fontSize: 13,
              letterSpacing: 2,
              opacity: 0.75,
            }}
          >
            {DOMAIN}
          </div>
        </div>

        {/* Right photo panel */}
        <div
          style={{
            display: 'flex',
            width: 380,
            height: 630,
            position: 'relative',
          }}
        >
          <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />

          {/* Dark warm overlay */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 380,
              height: 630,
              backgroundColor: 'rgba(26,20,0,0.35)',
            }}
          />

          {/* Corner bracket — top-right */}
          <div style={{ display: 'flex', position: 'absolute', top: 28, right: 28 }}>
            {/* horizontal bar */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                right: 0,
                width: 50,
                height: 2,
                backgroundColor: GOLD,
              }}
            />
            {/* vertical bar */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                right: 0,
                width: 2,
                height: 50,
                backgroundColor: GOLD,
              }}
            />
          </div>

          {/* Corner bracket — bottom-right */}
          <div style={{ display: 'flex', position: 'absolute', bottom: 28, right: 28 }}>
            {/* horizontal bar */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 50,
                height: 2,
                backgroundColor: GOLD,
              }}
            />
            {/* vertical bar */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 2,
                height: 50,
                backgroundColor: GOLD,
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
