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
const EYEBROW = 'RACHEL // BIRTHDAY // UNCLASSIFIED'
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
        background: '#0a0f0a',
        fontFamily: 'monospace',
        position: 'relative',
      }}
    >
      {/* Outer border */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          bottom: 10,
          border: '1px solid #1a2e1a',
          display: 'flex',
          pointerEvents: 'none',
        }}
      />

      {/* Inner corner marks — top-left */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          width: 20,
          height: 20,
          borderTop: '1px solid #2d4a2d',
          borderLeft: '1px solid #2d4a2d',
          display: 'flex',
        }}
      />
      {/* top-right */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          width: 20,
          height: 20,
          borderTop: '1px solid #2d4a2d',
          borderRight: '1px solid #2d4a2d',
          display: 'flex',
        }}
      />
      {/* bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          left: 18,
          width: 20,
          height: 20,
          borderBottom: '1px solid #2d4a2d',
          borderLeft: '1px solid #2d4a2d',
          display: 'flex',
        }}
      />
      {/* bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          right: 18,
          width: 20,
          height: 20,
          borderBottom: '1px solid #2d4a2d',
          borderRight: '1px solid #2d4a2d',
          display: 'flex',
        }}
      />

      {/* Scanline overlay — subtle horizontal lines */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,20,0,0.18) 3px, rgba(0,20,0,0.18) 4px)',
          display: 'flex',
          pointerEvents: 'none',
        }}
      />

      {/* Left content panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 48px 52px 52px',
        }}
      >
        {/* Top section */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* File header / doc number */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 3,
                  color: '#3a5a3a',
                  display: 'flex',
                }}
              >
                DOC-7741-B{/* PERSONAL GIFT DELIVERY */}
              </div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 3,
                  color: '#3a5a3a',
                  display: 'flex',
                }}
              >
                CLASSIFICATION: UNCLASSIFIED
              </div>
            </div>
            <div
              style={{
                border: '1px solid #2a4a2a',
                padding: '4px 10px',
                fontSize: 9,
                letterSpacing: 4,
                color: '#4a7a4a',
                display: 'flex',
              }}
            >
              APPROVED
            </div>
          </div>

          {/* Eyebrow */}
          <div
            style={{
              fontSize: 13,
              letterSpacing: 5,
              color: '#4a7a4a',
              marginBottom: 16,
              display: 'flex',
            }}
          >
            {EYEBROW}
          </div>

          {/* Redaction bar above title */}
          <div
            style={{
              width: 48,
              height: 3,
              background: '#4a7a4a',
              marginBottom: 12,
              display: 'flex',
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: 62,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: -1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ display: 'flex' }}>Happy Birthday</span>
            <span style={{ display: 'flex', color: '#e8ffe8' }}>Rachel!</span>
          </div>

          {/* Horizontal rule */}
          <div
            style={{
              height: 1,
              background: '#1a3a1a',
              marginTop: 24,
              marginBottom: 20,
              display: 'flex',
            }}
          />

          {/* Body */}
          <div
            style={{
              fontSize: 15,
              color: '#667766',
              lineHeight: 1.6,
              display: 'flex',
              maxWidth: 560,
            }}
          >
            {BODY}
          </div>
        </div>

        {/* Bottom section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Duration badges — security clearance style */}
          <div style={{ display: 'flex', gap: 10 }}>
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  border: '1px solid #4a7a4a',
                  padding: '6px 16px',
                  fontSize: 11,
                  letterSpacing: 3,
                  color: '#4a7a4a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    border: '1px solid #4a7a4a',
                    display: 'flex',
                  }}
                />
                {d.toUpperCase()}
              </div>
            ))}
            <div
              style={{
                border: '1px solid #2a3a2a',
                padding: '6px 16px',
                fontSize: 11,
                letterSpacing: 3,
                color: '#2a3a2a',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  background: '#1a2a1a',
                  display: 'flex',
                }}
              />
              ██ MIN
            </div>
          </div>

          {/* Domain */}
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: '#3a5a3a',
              display: 'flex',
            }}
          >
            {DOMAIN.toUpperCase()}
            {/* AUTHORIZED CHANNEL */}
          </div>
        </div>
      </div>

      {/* Photo panel — right side */}
      <div
        style={{
          width: 380,
          height: 630,
          display: 'flex',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Photo */}
        <img
          src={tableImg}
          width={380}
          height={630}
          alt=""
          aria-hidden="true"
          style={{ display: 'flex', objectFit: 'cover' }}
        />

        {/* Military green overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,40,0,0.4)',
            display: 'flex',
          }}
        />

        {/* Diagonal scan lines on photo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,30,0,0.12) 5px, rgba(0,30,0,0.12) 6px)',
            display: 'flex',
          }}
        />

        {/* Photo label — top */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: 3,
              color: '#4a7a4a',
              display: 'flex',
              background: 'rgba(0,10,0,0.6)',
              padding: '3px 8px',
            }}
          >
            IMG-02
          </div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              color: '#4a7a4a',
              display: 'flex',
              background: 'rgba(0,10,0,0.6)',
              padding: '3px 8px',
            }}
          >
            UNCLASSIFIED
          </div>
        </div>

        {/* Photo label — bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              color: '#3a5a3a',
              display: 'flex',
              background: 'rgba(0,10,0,0.7)',
              padding: '3px 8px',
            }}
          >
            FIELD ASSET{/* THERAPEUTIC */}
          </div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              color: '#4a7a4a',
              display: 'flex',
              background: 'rgba(0,10,0,0.7)',
              padding: '3px 8px',
            }}
          >
            {DOMAIN}
          </div>
        </div>

        {/* Reticle crosshair center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: '1px solid rgba(74,122,74,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                background: 'rgba(74,122,74,0.7)',
                display: 'flex',
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    { ...size }
  )
}
