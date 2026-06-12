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
        backgroundColor: '#ffffff',
        position: 'relative',
      }}
    >
      {/* LEFT PANEL — solid red block */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 240,
          height: 630,
          backgroundColor: '#dc2626',
          flexShrink: 0,
          padding: '28px 20px',
        }}
      >
        {/* Eyebrow top-left */}
        <span
          style={{
            display: 'flex',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {EYEBROW}
        </span>

        {/* Domain bottom-left */}
        <span
          style={{
            display: 'flex',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: 1,
            opacity: 0.85,
          }}
        >
          {DOMAIN}
        </span>
      </div>

      {/* CENTER CONTENT — white area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          padding: '48px 40px 48px 80px',
        }}
      >
        {/* Title */}
        <div
          style={{
            display: 'flex',
            color: '#000000',
            fontSize: 66,
            fontWeight: 900,
            lineHeight: 1.05,
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
            color: '#333333',
            fontSize: 24,
            lineHeight: 1.45,
            marginBottom: 36,
            maxWidth: 440,
          }}
        >
          {BODY}
        </div>

        {/* Duration pills */}
        <div style={{ display: 'flex', gap: 12 }}>
          {DURATIONS.map((d) => (
            <div
              key={d}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 2,
                padding: '10px 22px',
              }}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — photo */}
      <div style={{ display: 'flex', width: 380, height: 630, flexShrink: 0 }}>
        <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
      </div>

      {/* Yellow circle — overlapping red/white boundary, absolute on top */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 175,
          top: 250,
          width: 130,
          height: 130,
          borderRadius: '50%',
          backgroundColor: '#f59e0b',
        }}
      />
    </div>,
    { ...size }
  )
}
