# Iron Front

A small browser-based tactical game with a real-world OpenStreetMap basemap and a built-in textured fallback.

## Run

Open `index.html` in a browser or serve this directory (for example, `python3 -m http.server 8080`). The real-world map needs an internet connection and a browser that can load Leaflet and map tiles.

## OpenStreetMap tile usage

The default basemap uses the public `tile.openstreetmap.org` service for modest, interactive map display only. The game requests tiles for the currently visible map view; it does not bulk download, prefetch, or store tiles for offline use. Browser HTTP caching is left enabled so the browser can honor the tile server's cache headers. The application does not suppress the browser's normal User-Agent or Referer headers.

Visible attribution is kept above the map and game canvas as a direct, legible **© OpenStreetMap contributors** link to the copyright page. Leaflet also displays its tile-layer attribution. Tiles are not filtered or edited. The endpoint can be configured by setting `window.IRON_FRONT_TILE_URL` before `real-world-map.js` loads; use only a provider whose terms permit your usage.

The standard OSM tile service has limited capacity, no uptime guarantee, and may block unsuitable or heavy use. For high-volume, commercial, or production deployments, use a suitable tile provider or operate your own service in accordance with its terms. Review the current [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/) before deployment.

## Controls

- **WASD**: Move the active unit
- **Click**: Target an enemy
- **Space**: Attack
- Choose a map scale and location in the toolbar
