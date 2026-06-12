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
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
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
        background: '#0a0a1a',
      }}
    >
      {/* Background photo — full bleed */}
      <img
        src={tableImg}
        width={1200}
        height={630}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          objectFit: 'cover',
        }}
      />

      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          background: 'rgba(10,10,26,0.72)',
          display: 'flex',
        }}
      />

      {/* Content layer — centered flex column */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 80px',
        }}
      >
        {/* Top gold rule */}
        <div
          style={{
            width: 320,
            height: 1,
            background: '#c9a84c',
            display: 'flex',
            marginBottom: 18,
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 6,
            color: '#c9a84c',
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          {EYEBROW}
        </div>

        {/* Bottom gold rule flanking eyebrow */}
        <div
          style={{
            width: 320,
            height: 1,
            background: '#c9a84c',
            display: 'flex',
            marginBottom: 36,
          }}
        />

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 78,
            fontWeight: 700,
            color: '#c9a84c',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 28,
            maxWidth: 900,
          }}
        >
          {TITLE}
        </div>

        {/* Body */}
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            color: '#8a8a9a',
            textAlign: 'center',
            lineHeight: 1.5,
            marginBottom: 40,
            maxWidth: 820,
          }}
        >
          {BODY}
        </div>

        {/* Duration pills */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 16,
            marginBottom: 52,
          }}
        >
          {DURATIONS.map((d) => (
            <div
              key={d}
              style={{
                display: 'flex',
                border: '1px solid #c9a84c',
                borderRadius: 40,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 28,
                paddingRight: 28,
                fontSize: 18,
                fontWeight: 600,
                color: '#c9a84c',
                letterSpacing: 2,
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
            fontSize: 16,
            color: '#4a4a6a',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {DOMAIN}
        </div>
      </div>
    </div>,
    { ...size }
  )
}
