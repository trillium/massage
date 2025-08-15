import React from 'react'
import Image from 'next/image'
import { LA_BOUNDS, IMAGE_CONFIG } from '@/lib/mapConfig'

interface StaticSpriteMapProps {
  lat: number
  lng: number
  viewport?: { width: number; height: number }
  showMarker?: boolean
  markerColor?: string
  className?: string
}

/**
 * Convert latitude/longitude to pixel coordinates on the LA map image
 */
function latLngToPixel(lat: number, lng: number) {
  const x = ((lng - LA_BOUNDS.west) / (LA_BOUNDS.east - LA_BOUNDS.west)) * IMAGE_CONFIG.width
  const y = ((LA_BOUNDS.north - lat) / (LA_BOUNDS.north - LA_BOUNDS.south)) * IMAGE_CONFIG.height
  return { x, y }
}

/**
 * Static sprite map component that shows a portion of the LA map
 * Uses a pre-generated static image of Los Angeles
 */
export default function StaticSpriteMap({
  lat,
  lng,
  viewport = { width: 400, height: 300 },
  showMarker = true,
  markerColor = '#dc2626', // red-600
  className = '',
}: StaticSpriteMapProps) {
  // Check if coordinates are within LA bounds
  const isInBounds =
    lat >= LA_BOUNDS.south &&
    lat <= LA_BOUNDS.north &&
    lng >= LA_BOUNDS.west &&
    lng <= LA_BOUNDS.east

  if (!isInBounds) {
    return (
      <div
        className={`flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width: viewport.width, height: viewport.height }}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">Location outside LA area</p>
          <p className="text-xs">
            Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
          </p>
        </div>
      </div>
    )
  }

  const { x, y } = latLngToPixel(lat, lng)

  // Calculate viewport position (center the marker)
  const left = Math.max(0, Math.min(x - viewport.width / 2, IMAGE_CONFIG.width - viewport.width))
  const top = Math.max(0, Math.min(y - viewport.height / 2, IMAGE_CONFIG.height - viewport.height))

  // Marker position relative to viewport
  const markerX = x - left
  const markerY = y - top

  return (
    <div
      className={`relative overflow-hidden rounded ${className}`}
      style={{ width: viewport.width, height: viewport.height }}
    >
      {/* Map image */}
      <Image
        src="/la-map.png"
        alt="Los Angeles Map"
        width={IMAGE_CONFIG.width}
        height={IMAGE_CONFIG.height}
        className="absolute"
        style={{
          left: -left,
          top: -top,
        }}
        unoptimized
        priority
      />

      {/* Location marker */}
      {showMarker && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: markerX - 8,
            top: markerY - 16,
          }}
        >
          <div
            className="h-4 w-4 rounded-full border-2 border-white shadow-lg"
            style={{ backgroundColor: markerColor }}
          />
          <div
            className="absolute top-4 left-1/2 h-0 w-0 -translate-x-1/2 transform shadow-sm"
            style={{
              borderLeft: '2px solid transparent',
              borderRight: '2px solid transparent',
              borderTop: `2px solid ${markerColor}`,
            }}
          />
        </div>
      )}

      {/* Overlay with coordinates (optional debug info) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-opacity-50 absolute right-1 bottom-1 rounded bg-black px-1 py-0.5 text-xs text-white">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      )}
    </div>
  )
}

/**
 * Hook to check if coordinates are within LA bounds
 */
export function useIsInLABounds(lat: number, lng: number): boolean {
  return (
    lat >= LA_BOUNDS.south &&
    lat <= LA_BOUNDS.north &&
    lng >= LA_BOUNDS.west &&
    lng <= LA_BOUNDS.east
  )
}

/**
 * Utility to get LA map bounds for external use
 */
export function getLABounds() {
  return LA_BOUNDS
}

/**
 * Utility to get image configuration
 */
export function getImageConfig() {
  return IMAGE_CONFIG
}
