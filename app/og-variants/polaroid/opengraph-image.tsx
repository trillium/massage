/* ds-ignore-file */
import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

const TITLE = 'Happy Birthday Rachel!'
const BODY = "I didn't get you a gift but I thought this would suffice. Please enjoy a 60 or 90 minute massage from me at a location of your choosing."
const EYEBROW = 'BIRTHDAY GIFT'
const DOMAIN = 'trilliummassage.la'
const DURATIONS = ['60 min', '90 min']

async function loadTableImage(): Promise<string> {
  const buf = await sharp(join(process.cwd(), 'public/static/images/table/table_square_02.webp'))
    .resize(836, 400, { fit: 'cover', position: 'centre' })
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
          alignItems: 'center',
          justifyContent: 'center',
          background: '#e0e0e0',
          flexDirection: 'column',
        }}
      >
        {/* Eyebrow above card */}
        <div
          style={{
            display: 'flex',
            marginBottom: 16,
            fontSize: 13,
            letterSpacing: 3,
            color: '#888888',
            fontFamily: 'sans-serif',
            textTransform: 'uppercase',
          }}
        >
          {EYEBROW}
        </div>

        {/* Card container — shadow card behind + white card on top */}
        <div
          style={{
            display: 'flex',
            position: 'relative',
            width: 900,
          }}
        >
          {/* Shadow card (behind) */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 8,
              left: 8,
              width: 900,
              height: 560,
              background: '#aaaaaa',
              borderRadius: 4,
            }}
          />

          {/* White polaroid card (front) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 900,
              background: '#ffffff',
              borderRadius: 4,
              paddingTop: 32,
              paddingLeft: 32,
              paddingRight: 32,
              paddingBottom: 0,
              position: 'relative',
            }}
          >
            {/* Photo area */}
            <div
              style={{
                display: 'flex',
                width: 836,
                height: 400,
                overflow: 'hidden',
                borderRadius: 2,
              }}
            >
              <img
                src={tableImg}
                width={836}
                height={400}
                alt=""
                aria-hidden="true"
                style={{ objectFit: 'cover', display: 'flex' }}
              />
            </div>

            {/* Bottom white strip */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 80,
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 32,
                  color: '#1a1a1a',
                  fontFamily: 'sans-serif',
                  fontWeight: 700,
                  letterSpacing: -0.5,
                }}
              >
                {TITLE}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 18,
                  color: '#999999',
                  fontFamily: 'sans-serif',
                  marginTop: 4,
                }}
              >
                {DOMAIN}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
