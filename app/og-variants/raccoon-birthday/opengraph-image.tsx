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
        background: '#1c1c1c',
        position: 'relative',
      }}
    >
      {/* Left accent bar — 13px wide (raccoon miscounted, should be 8 or 10) */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: 0,
          width: 13,
          height: 630,
          background: '#c9a84c',
        }}
      />

      {/* Left content column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          paddingLeft: 64,
          paddingRight: 48,
          paddingTop: 60,
          paddingBottom: 60,
        }}
      >
        {/* Eyebrow — gold, 16px, spelled correctly */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 28,
              height: 2,
              background: '#c9a84c',
              marginRight: 10,
            }}
          />
          <span
            style={{
              display: 'flex',
              fontSize: 16,
              color: '#c9a84c',
              letterSpacing: 3,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {EYEBROW}
          </span>
        </div>

        {/* Title — 76px white, almost perfect */}
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            color: '#ffffff',
            fontWeight: 700,
            lineHeight: 1.05,
            marginBottom: 28,
            letterSpacing: -1,
          }}
        >
          {TITLE}
        </div>

        {/* Body text — 24px */}
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#c8c8c8',
            lineHeight: 1.5,
            marginBottom: 36,
            maxWidth: 580,
          }}
        >
          {BODY}
        </div>

        {/* Duration pills — one is 2px taller than the other (raccoons) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 14,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #c9a84c',
              borderRadius: 24,
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 22,
              paddingRight: 22,
              fontSize: 18,
              color: '#c9a84c',
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            {DURATIONS[0]}
          </div>
          {/* This pill is 2px taller — raccoon didn't notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #c9a84c',
              borderRadius: 24,
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 22,
              paddingRight: 22,
              fontSize: 18,
              color: '#c9a84c',
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            {DURATIONS[1]}
          </div>
        </div>

        {/* Domain — slightly too high by about 6px */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 44,
            left: 64,
          }}
        >
          <span
            style={{
              display: 'flex',
              fontSize: 15,
              color: '#888888',
              letterSpacing: 1,
            }}
          >
            {DOMAIN}
          </span>
        </div>
      </div>

      {/* Right photo — flush to right edge */}
      <div
        style={{
          display: 'flex',
          width: 380,
          height: 630,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Gradient overlay on left edge of photo for blend */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: 380,
            top: 0,
            width: 80,
            height: 630,
            background: 'linear-gradient(to right, #1c1c1c, transparent)',
            zIndex: 2,
          }}
        />
        <img src={tableImg} width={380} height={630} alt="" aria-hidden="true" />
      </div>
    </div>,
    { ...size }
  )
}
