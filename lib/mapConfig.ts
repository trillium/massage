// Default coordinates and zoom for demonstration
export const DEFAULT_VIEW = {
  longitude: -118.3816, // West LA / Culver City area
  latitude: 34.0259,
  zoom: 11,
}
/**
 * Client-side constants for LA map bounds and image configuration
 * This file can be safely imported in both client and server components
 */

// Los Angeles bounds - covers most of LA County
export const LA_BOUNDS = {
  north: 34.337, // Northernmost point (around Palmdale/Lancaster area)
  south: 33.704, // Southernmost point (around San Pedro/Long Beach)
  west: -118.668, // Westernmost point (around Malibu)
  east: -118.155, // Easternmost point (around San Bernardino County line)
}

// Image configuration
export const IMAGE_CONFIG = {
  width: 4096,
  height: 4096,
  zoom: 11,
  format: 'png' as const,
  style: 'https://tiles.openfreemap.org/styles/positron',
}
