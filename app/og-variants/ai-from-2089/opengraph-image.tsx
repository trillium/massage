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
        background: '#111111',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left content panel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: 820,
          height: 630,
          padding: '56px 60px',
        }}
      >
        {/* Eyebrow */}
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
              width: 28,
              height: 2,
              background: '#d4a843',
              marginRight: 12,
            }}
          />
          <div
            style={{
              display: 'flex',
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 4,
              color: '#d4a843',
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
            fontSize: 80,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.05,
            marginBottom: 24,
          }}
        >
          {TITLE}
        </div>

        {/* Body */}
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: '#cccccc',
            lineHeight: 1.5,
            marginBottom: 32,
          }}
        >
          {BODY}
        </div>

        {/* Duration chips */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            marginBottom: 32,
          }}
        >
          {DURATIONS.map((d) => (
            <div
              key={d}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 28px',
                border: '2px solid #d4a843',
                color: '#d4a843',
                fontSize: 20,
                fontWeight: 600,
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
            fontSize: 15,
            color: '#555555',
            letterSpacing: 2,
          }}
        >
          {DOMAIN}
        </div>
      </div>

      {/* Photo — right side */}
      <div
        style={{
          display: 'flex',
          width: 380,
          height: 630,
        }}
      >
        <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
      </div>

      {/* 2089 LOAD-BEARING UI: vertical rainbow strip at x=820 */}
      {/* In 2026 this looks decorative. In 2089 it carries 14ms of render state. */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          position: 'absolute',
          top: 0,
          left: 820,
          width: 12,
          height: 630,
        }}
      >
        <div style={{ display: 'flex', width: 2, height: 630, background: '#ff0000' }} />
        <div style={{ display: 'flex', width: 2, height: 630, background: '#ff8800' }} />
        <div style={{ display: 'flex', width: 2, height: 630, background: '#ffff00' }} />
        <div style={{ display: 'flex', width: 2, height: 630, background: '#00ff00' }} />
        <div style={{ display: 'flex', width: 2, height: 630, background: '#0088ff' }} />
        <div style={{ display: 'flex', width: 2, height: 630, background: '#8800ff' }} />
      </div>
    </div>,
    { ...size }
  )
}
