import { LA_BOUNDS, IMAGE_CONFIG } from './mapConfig.js'

/**
 * Generate a self-contained HTML file for map generation
 * This HTML includes everything needed to render the map without external dependencies
 */
export function generateStandaloneMapHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
    <title>Los Angeles Map Generator - Automated</title>
    <script src='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js'></script>
    <link href='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css' rel='stylesheet' />
    <style>
        body { 
            margin: 0; 
            padding: 0;
            background: #f0f0f0;
        }
        #map { 
            width: ${IMAGE_CONFIG.width}px; 
            height: ${IMAGE_CONFIG.height}px; 
            border: none;
        }
        .status {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255,255,255,0.9);
            padding: 10px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div class="status" id="status">Initializing...</div>
    <div id="map"></div>

    <script>
        // Initialize map
        const map = new maplibregl.Map({
            container: 'map',
            style: 'https://tiles.openfreemap.org/styles/liberty',
            center: [${(LA_BOUNDS.west + LA_BOUNDS.east) / 2}, ${(LA_BOUNDS.north + LA_BOUNDS.south) / 2}],
            zoom: ${IMAGE_CONFIG.zoom},
            bearing: 0,
            pitch: 0,
            interactive: false // Disable interactions for cleaner capture
        });

        // Make map globally accessible
        window.map = map;
        window.mapReady = false;

        // Update status
        document.getElementById('status').textContent = 'Loading map tiles...';

        // Fit to LA bounds when map loads
        map.on('load', function() {
            document.getElementById('status').textContent = 'Fitting to LA bounds...';
            
            map.fitBounds([
                [${LA_BOUNDS.west}, ${LA_BOUNDS.south}], // Southwest corner
                [${LA_BOUNDS.east}, ${LA_BOUNDS.north}]   // Northeast corner
            ], {
                padding: 20,
                duration: 0 // No animation for automation
            });
        });

        // Mark as ready when all tiles are loaded
        map.on('idle', function() {
            if (!window.mapReady) {
                window.mapReady = true;
                document.getElementById('status').textContent = 'Map ready for capture!';
            }
        });

        // Error handling
        map.on('error', function(e) {
            console.error('Map error:', e);
            document.getElementById('status').textContent = 'Map error: ' + e.error.message;
        });
    </script>
</body>
</html>`
}
