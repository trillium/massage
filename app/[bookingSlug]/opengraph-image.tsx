/* ds-ignore-file */
import React from 'react'
import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
export const alt = 'Trillium Massage'

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: 64,
        fontWeight: 700,
      }}
    >
      Trillium Massage
    </div>,
    { ...size }
  )
}
