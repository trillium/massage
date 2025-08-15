import maplibregl from 'maplibre-gl'

// Extend MapLibre GL type to include workerCount property
interface MapLibreGLWithWorkerCount {
  workerCount: number
}

// Configure MapLibre GL to work with Next.js CSP
if (typeof window !== 'undefined') {
  // Disable workers to avoid CSP issues in development
  ;(maplibregl as unknown as MapLibreGLWithWorkerCount).workerCount = 0
}

export default maplibregl
