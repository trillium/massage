'use client'

import * as React from 'react'
import CachedTileMap from './CachedTileMap'
import { DEFAULT_VIEW } from '@/lib/mapConfig'

export default function MapTile({
  longitude = DEFAULT_VIEW.longitude,
  latitude = DEFAULT_VIEW.latitude,
  zoom = 12,
  style = { width: '100%', height: '100%' },
  showMarker = true,
}: {
  longitude?: number
  latitude?: number
  zoom?: number
  style?: React.CSSProperties
  showMarker?: boolean
}) {
  // Use the new CachedTileMap component
  return (
    <CachedTileMap
      longitude={longitude}
      latitude={latitude}
      zoom={zoom}
      style={style}
      showMarker={showMarker}
    />
  )
}
