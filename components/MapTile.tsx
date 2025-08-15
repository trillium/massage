'use client'

import * as React from 'react'
import Map from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import './maplibre-worker-setup'
import StaticSpriteMap, { useIsInLABounds } from './StaticSpriteMap'
import { IMAGE_CONFIG, DEFAULT_VIEW } from '@/lib/mapConfig'

export default function MapTile({
  longitude = DEFAULT_VIEW.longitude,
  latitude = DEFAULT_VIEW.latitude,
  zoom = DEFAULT_VIEW.zoom,
  style = { width: '100%', height: '100%' },
  useStaticSpriteOnly = false, // New option to use only static sprite
}: {
  longitude?: number
  latitude?: number
  zoom?: number
  style?: React.CSSProperties
  showStaticPlaceholder?: boolean
  useStaticSpriteOnly?: boolean
}) {
  const [mapLoaded, setMapLoaded] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // If using static sprite only, return that component
  if (useStaticSpriteOnly) {
    const width = typeof style.width === 'number' ? style.width : 400
    const height = typeof style.height === 'number' ? style.height : 300

    return (
      <StaticSpriteMap
        lat={latitude}
        lng={longitude}
        viewport={{ width, height }}
        className="rounded"
      />
    )
  }

  return (
    <div style={style} className="relative h-full overflow-hidden" ref={containerRef}>
      {/* Interactive map with scaling container */}
      <div className="h-full w-full overflow-hidden rounded-lg shadow-lg">
        <div className="h-full w-full">
          <Map
            mapStyle={IMAGE_CONFIG.style}
            initialViewState={{ longitude, latitude, zoom }}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '100%',
            }}
            interactive={false}
            onLoad={() => {
              setMapLoaded(true)
            }}
            attributionControl={false}
          />

          {/* Simple SVG circle overlay for appointment location */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <svg width="200" height="200" className="overflow-visible">
              <circle
                cx="100"
                cy="100"
                r="80"
                className="fill-primary-500/20 stroke-primary-500 stroke-2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
