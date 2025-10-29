'use client'

import * as React from 'react'
import clsx from 'clsx'

interface CachedTileMapProps {
  longitude: number
  latitude: number
  zoom?: number
  style?: React.CSSProperties
  className?: string
  showMarker?: boolean
}

function calculateTileData(
  longitude: number,
  latitude: number,
  zoom: number,
  containerSize: { width: number; height: number }
) {
  // Calculate tile coordinates
  const tileX = ((longitude + 180) / 360) * Math.pow(2, zoom)
  const tileY =
    ((1 -
      Math.log(Math.tan((latitude * Math.PI) / 180) + 1 / Math.cos((latitude * Math.PI) / 180)) /
        Math.PI) /
      2) *
    Math.pow(2, zoom)

  const centerTileX = Math.floor(tileX)
  const centerTileY = Math.floor(tileY)

  // Calculate pixel offset within center tile (0-256)
  const offsetX = (tileX - centerTileX) * 256
  const offsetY = (tileY - centerTileY) * 256

  // Calculate how many tiles we need to cover the viewport
  const tilesNeededX = Math.ceil(containerSize.width / 256) + 1
  const tilesNeededY = Math.ceil(containerSize.height / 256) + 1

  // Calculate tile range to load (centered around the center tile)
  const startX = Math.floor(-tilesNeededX / 2)
  const endX = Math.ceil(tilesNeededX / 2)
  const startY = Math.floor(-tilesNeededY / 2)
  const endY = Math.ceil(tilesNeededY / 2)

  return {
    centerTileX,
    centerTileY,
    offsetX,
    offsetY,
    startX,
    endX,
    startY,
    endY,
  }
}

export default function CachedTileMap({
  longitude,
  latitude,
  zoom = 13, // Default zoom level
  style = { width: '100%', height: '100%' },
  className = '',
  showMarker = true,
}: CachedTileMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = React.useState({ width: 512, height: 512 })

  // Get container dimensions
  React.useEffect(() => {
    if (!containerRef.current) return

    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  const tileData = calculateTileData(longitude, latitude, zoom, containerSize)

  return (
    <div
      style={style}
      className={clsx(
        'relative overflow-hidden rounded-lg border-2 border-gray-300 bg-transparent dark:border-gray-500',
        className
      )}
      ref={containerRef}
    >
      <div className="h-full w-full overflow-hidden">
        <div className="relative h-full w-full">
          <Tiles tileData={tileData} containerSize={containerSize} zoom={zoom} />
          <Marker showMarker={showMarker} />
        </div>
      </div>
    </div>
  )
}

interface TilesProps {
  tileData: ReturnType<typeof calculateTileData>
  containerSize: { width: number; height: number }
  zoom: number
}

export function Tiles({ tileData, containerSize, zoom }: TilesProps) {
  const { centerTileX, centerTileY, offsetX, offsetY, startX, endX, startY, endY } = tileData

  // Generate tile array
  const tiles = React.useMemo(() => {
    const tileArray: Array<{ x: number; y: number; left: number; top: number }> = []
    for (let dy = startY; dy <= endY; dy++) {
      for (let dx = startX; dx <= endX; dx++) {
        const tileXCoord = centerTileX + dx
        const tileYCoord = centerTileY + dy

        // Skip tiles outside valid range
        const maxTile = Math.pow(2, zoom) - 1
        if (tileXCoord < 0 || tileXCoord > maxTile || tileYCoord < 0 || tileYCoord > maxTile) {
          continue
        }

        tileArray.push({
          x: tileXCoord,
          y: tileYCoord,
          left: Math.round((containerSize.width / 2 + dx * 256 - offsetX) * 1000) / 1000,
          top: Math.round((containerSize.height / 2 + dy * 256 - offsetY) * 1000) / 1000,
        })
      }
    }
    return tileArray
  }, [centerTileX, centerTileY, startX, endX, startY, endY, offsetX, offsetY, containerSize, zoom])

  return (
    <>
      {tiles.map((tile) => {
        const tileKey = `${tile.x}-${tile.y}`
        const tileStyles = {
          left: `${tile.left}px`,
          top: `${tile.top}px`,
          width: '256px',
          height: '256px',
        }
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tileKey}
            src={`/api/tiles/${zoom}/${tile.x}/${tile.y}?v=2`}
            alt=""
            className="pointer-events-none absolute select-none"
            style={tileStyles}
            loading="eager"
            draggable={false}
          />
        )
      })}
    </>
  )
}

interface MarkerProps {
  showMarker: boolean
}

export function Marker({ showMarker }: MarkerProps) {
  if (!showMarker) return null

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <svg width="200" height="200" className="overflow-visible">
        <circle
          cx="100"
          cy="100"
          r="120"
          className="fill-primary-500/20 stroke-primary-500 stroke-2"
        />
      </svg>
    </div>
  )
}
