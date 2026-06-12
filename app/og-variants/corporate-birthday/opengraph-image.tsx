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
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* Header bar — PowerPoint master slide style */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: 48,
          backgroundColor: '#003087',
          paddingLeft: 20,
          paddingRight: 20,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontSize: 14,
            letterSpacing: 1.2,
            fontWeight: 600,
          }}
        >
          RACHEL BIRTHDAY INITIATIVE — FY2026 Q2 DELIVERABLE
        </span>
        <div style={{ display: 'flex', flex: 1 }} />
        <span
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 11,
            letterSpacing: 0.5,
          }}
        >
          CONFIDENTIAL
        </span>
      </div>

      {/* Main content area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
        }}
      >
        {/* Left content panel */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            padding: 40,
            justifyContent: 'center',
          }}
        >
          {/* Eyebrow / badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                backgroundColor: '#e8eef7',
                border: '1px solid #003087',
                borderRadius: 2,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 4,
                paddingBottom: 4,
              }}
            >
              <span
                style={{
                  color: '#003087',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                {EYEBROW}
              </span>
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              color: '#003087',
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: -0.5,
            }}
          >
            {TITLE}
          </div>

          {/* Body text box — slide text box style */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid #cccccc',
              padding: 16,
              marginBottom: 24,
              backgroundColor: '#fafafa',
            }}
          >
            <span
              style={{
                color: '#333333',
                fontSize: 18,
                lineHeight: 1.5,
              }}
            >
              {BODY}
            </span>
          </div>

          {/* Duration pills */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 10,
            }}
          >
            {DURATIONS.map((d) => (
              <div
                key={d}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#27ae60',
                  borderRadius: 4,
                  paddingLeft: 14,
                  paddingRight: 14,
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              >
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  ● STATUS: {d}
                </span>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#e8eef7',
                borderRadius: 4,
                paddingLeft: 14,
                paddingRight: 14,
                paddingTop: 6,
                paddingBottom: 6,
                border: '1px solid #003087',
              }}
            >
              <span
                style={{
                  color: '#003087',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                ● APPROVED
              </span>
            </div>
          </div>
        </div>

        {/* Right photo panel */}
        <div
          style={{
            display: 'flex',
            width: 380,
            height: 550,
            flexShrink: 0,
            border: '2px solid #cccccc',
            margin: 16,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={tableImg}
            width={380}
            height={550}
            alt=""
            aria-hidden="true"
            style={{ objectFit: 'cover' }}
          />
          {/* Slide caption label over photo */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,48,135,0.85)',
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 6,
              paddingBottom: 6,
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              FIG. 1 — DELIVERY MECHANISM
            </span>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: 32,
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #dddddd',
          paddingLeft: 20,
          paddingRight: 20,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: '#888888',
            fontSize: 12,
            letterSpacing: 0.5,
          }}
        >
          {DOMAIN}
        </span>
        <div style={{ display: 'flex', flex: 1 }} />
        <span
          style={{
            color: '#aaaaaa',
            fontSize: 11,
          }}
        >
          Slide 1 of 1 · Executive Review Ready
        </span>
      </div>
    </div>,
    { ...size }
  )
}
