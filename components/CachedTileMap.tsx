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
  const [tilesLoaded, setTilesLoaded] = React.useState(false)

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
          left: containerSize.width / 2 + dx * 256 - offsetX,
          top: containerSize.height / 2 + dy * 256 - offsetY,
        })
      }
    }
    return tileArray
  }, [centerTileX, centerTileY, startX, endX, startY, endY, offsetX, offsetY, containerSize, zoom])

  // Track loaded tiles
  const loadedTiles = React.useRef(new Set<string>())
  const handleTileLoad = (tileKey: string) => {
    loadedTiles.current.add(tileKey)
    if (loadedTiles.current.size === tiles.length && tiles.length > 0) {
      setTilesLoaded(true)
    }
  }

  const zoomChange = 13

  return (
    <div style={style} className={clsx('relative overflow-hidden', className)} ref={containerRef}>
      {/* Tile container with proper styling */}
      <div className="h-full w-full overflow-hidden rounded-lg shadow-lg">
        <div className="relative h-full w-full bg-gray-100">
          {/* Render tiles */}
          {tiles.map((tile) => {
            const tileKey = `${tile.x}-${tile.y}`
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={tileKey}
                src={`/api/tiles/${zoom}/${tile.x}/${tile.y}?v=2`}
                alt=""
                className="pointer-events-none absolute select-none"
                style={{
                  left: tile.left,
                  top: tile.top,
                  width: 256,
                  height: 256,
                }}
                loading="eager"
                onLoad={() => handleTileLoad(tileKey)}
                draggable={false}
              />
            )
          })}

          {/* Marker overlay - same as original */}
          {showMarker && (
            <div
              className={clsx(
                'pointer-events-none absolute inset-0 flex items-center justify-center',
                { 'opacity-0': !tilesLoaded, 'opacity-100': tilesLoaded },
                'transition-opacity duration-300'
              )}
            >
              <svg width="200" height="200" className="overflow-visible">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  className="fill-primary-500/20 stroke-primary-500 stroke-2"
                />
              </svg>
            </div>
          )}

          {/* Loading indicator */}
          {!tilesLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-primary-500 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
