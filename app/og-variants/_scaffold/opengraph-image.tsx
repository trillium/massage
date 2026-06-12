/* ds-ignore-file */ /* content-ok-file */
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VARIANT: SCAFFOLD TEMPLATE
// STYLE:   Copy this file, rename the directory, implement your design
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

// ── FIXED DATA — do not change ───────────────
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
// ─────────────────────────────────────────────

export default async function Image() {
  const tableImg = await loadTableImage()

  // ── YOUR DESIGN GOES HERE ─────────────────
  // Satori constraints:
  // • display:'flex' on EVERY div (not optional)
  // • No CSS Grid — flex only
  // • No pseudo-elements (::before/::after)
  // • position:'absolute' works — DOM order = z-index
  // • transform:'rotate(Xdeg)' works
  // • border:'Npx dashed/solid #color' works (NOT dotted)
  // • No calc(), no CSS variables, no box-shadow
  // • Hardcode all numeric values
  // • Use <img> for the table photo (not next/image)
  //   with alt="" aria-hidden="true"
  // • linear-gradient() works on background property
  // • borderRadius works including per-corner
  // ─────────────────────────────────────────

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#1a1a1a' }}>
      {/* YOUR DESIGN HERE */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 48,
        }}
      >
        {TITLE}
      </div>
    </div>,
    { ...size }
  )
}
