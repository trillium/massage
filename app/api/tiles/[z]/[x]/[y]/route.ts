import { NextRequest, NextResponse } from 'next/server'

const TILE_SOURCES = [
  {
    name: 'carto-light',
    url: (z: string, x: string, y: string) =>
      `https://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`,
    headers: {} as HeadersInit,
  },
  {
    name: 'carto-light-b',
    url: (z: string, x: string, y: string) =>
      `https://b.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`,
    headers: {} as HeadersInit,
  },
  {
    name: 'osm',
    url: (z: string, x: string, y: string) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
    headers: {
      'User-Agent': 'MassageBooking/1.0 (https://massagebooking.com)',
    } as HeadersInit,
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y } = await params

  // Try each tile source in order
  for (const source of TILE_SOURCES) {
    try {
      const response = await fetch(source.url(z, x, y), {
        headers: source.headers,
        next: {
          revalidate: 2592000, // Cache for 30 days (in seconds)
          tags: [`tile-${z}-${x}-${y}`, `source-${source.name}`],
        },
      })

      if (response.ok) {
        const buffer = await response.arrayBuffer()

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'image/png',
            // Cache for 30 days
            'Cache-Control': 'public, max-age=2592000, s-maxage=2592000',
            'CDN-Cache-Control': 'max-age=2592000',
            'Vercel-CDN-Cache-Control': 'max-age=2592000',
            'X-Tile-Source': source.name,
          },
        })
      }
    } catch (error) {
      console.error(`Failed to fetch tile from ${source.name}:`, error)
    }
  }

  // If all sources fail, return a simple gray error tile
  return generateErrorTile()
}

async function generateErrorTile() {
  // Create a simple SVG error tile
  const svg = `
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#f0f0f0" stroke="#ccc" stroke-width="1"/>
      <text x="128" y="128" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="14">
        Tile unavailable
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    status: 503,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600', // Cache errors for 1 hour
    },
  })
}
