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
        background: '#c8a96e',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Diagonal ribbon strip — top third */}
      <div
        style={{
          position: 'absolute',
          top: 148,
          left: '-15%',
          width: '130%',
          height: 16,
          background: '#c0392b',
          opacity: 0.6,
          transform: 'rotate(12deg)',
          display: 'flex',
        }}
      />

      {/* Diagonal ribbon strip — bottom third */}
      <div
        style={{
          position: 'absolute',
          top: 424,
          left: '-15%',
          width: '130%',
          height: 16,
          background: '#c0392b',
          opacity: 0.6,
          transform: 'rotate(12deg)',
          display: 'flex',
        }}
      />

      {/* White tag surface */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 28,
          right: 28,
          bottom: 28,
          display: 'flex',
          flexDirection: 'row',
          borderRadius: 20,
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Left: photo panel */}
        <div style={{ display: 'flex', width: 380, flexShrink: 0 }}>
          <img src={tableImg} width={380} height={574} alt="" aria-hidden="true" />
        </div>

        {/* Right: text content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '52px 52px 40px 52px',
            justifyContent: 'space-between',
          }}
        >
          {/* Top section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Eyebrow */}
            <div
              style={{
                display: 'flex',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 3,
                color: '#8b0000',
                textTransform: 'uppercase',
              }}
            >
              {EYEBROW}
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                fontSize: 68,
                fontWeight: 800,
                color: '#1a0a00',
                lineHeight: 1.05,
                flexWrap: 'wrap',
              }}
            >
              {TITLE}
            </div>

            {/* Body */}
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                color: '#5c3d1a',
                lineHeight: 1.45,
                flexWrap: 'wrap',
                marginTop: 8,
              }}
            >
              {BODY}
            </div>
          </div>

          {/* Bottom section: durations + domain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Duration pills */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
              {DURATIONS.map((d) => (
                <div
                  key={d}
                  style={{
                    display: 'flex',
                    paddingTop: 8,
                    paddingBottom: 8,
                    paddingLeft: 22,
                    paddingRight: 22,
                    borderRadius: 999,
                    border: '2px solid #8b0000',
                    color: '#8b0000',
                    fontSize: 18,
                    fontWeight: 600,
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
                color: '#8b0000',
                letterSpacing: 1,
                opacity: 0.8,
              }}
            >
              {DOMAIN}
            </div>
          </div>
        </div>
      </div>

      {/* Punch hole circle — top-left of tag */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#ffffff',
          border: '3px solid #1a0a00',
          display: 'flex',
        }}
      />
    </div>,
    { ...size }
  )
}
