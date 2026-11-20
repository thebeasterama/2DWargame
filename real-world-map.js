/* Real-world basemap layer powered by OpenStreetMap tiles via Leaflet. */
(() => {
  const mapLocations = {
    city: [
      { name: 'Paris, France', region: 'Île-de-France · France', center: [48.8566, 2.3522] },
      { name: 'New York City, USA', region: 'New York · United States', center: [40.7128, -74.0060] },
      { name: 'Tokyo, Japan', region: 'Tokyo Metropolis · Japan', center: [35.6762, 139.6503] }
    ],
    state: [
      { name: 'California, USA', region: 'United States', center: [36.7783, -119.4179] },
      { name: 'Texas, USA', region: 'United States', center: [31.0000, -99.0000] },
      { name: 'Florida, USA', region: 'United States', center: [27.6648, -81.5158] }
    ],
    country: [
      { name: 'France', region: 'Western Europe', center: [46.2276, 2.2137] },
      { name: 'Japan', region: 'East Asia', center: [36.2048, 138.2529] },
      { name: 'Egypt', region: 'North Africa', center: [26.8206, 30.8025] }
    ],
    world: [
      { name: 'Western Europe', region: 'Europe', center: [50.5, 10.0] },
      { name: 'East Asia', region: 'Asia-Pacific', center: [35.0, 110.0] },
      { name: 'The World', region: 'Global overview', center: [20.0, 0.0] }
    ]
  };
  const zoomByScale = { city: 13, state: 6, country: 5, world: 3 };
  const mapElement = document.getElementById('worldMap');
  const statusElement = document.getElementById('mapStatus');
  const scaleSelect = document.getElementById('mapScale');
  const locationSelect = document.getElementById('location');

  function showFallback(message) {
    mapElement?.classList.add('map-fallback');
    if (statusElement) statusElement.textContent = message;
  }
  if (!mapElement || !window.L) {
    showFallback('Map tiles unavailable — tactical terrain remains playable.');
    return;
  }

  const map = L.map(mapElement, {
    zoomControl: false, attributionControl: true, dragging: false,
    touchZoom: false, doubleClickZoom: false, scrollWheelZoom: false,
    boxZoom: false, keyboard: false
  }).setView(mapLocations.city[0].center, zoomByScale.city);
  const tileUrl = window.IRON_FRONT_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  let loadedVisibleTiles = 0;
  const tiles = L.tileLayer(tileUrl, {
    maxZoom: 19, updateWhenIdle: true, keepBuffer: 2,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  });
  tiles.on('tileload', () => {
    loadedVisibleTiles++;
    mapElement.classList.remove('map-fallback');
    if (statusElement) statusElement.textContent = 'REAL-WORLD MAP';
  });
  tiles.on('tileerror', () => {
    if (!loadedVisibleTiles) showFallback('Map tiles unavailable — check connection or use another tile provider.');
  });
  tiles.addTo(map);
  mapElement.classList.add('map-fallback');

  function updateMap() {
    if (!scaleSelect || !locationSelect) return;
    const scale = scaleSelect.value;
    const places = mapLocations[scale] || mapLocations.city;
    const place = places[Number(locationSelect.value) || 0] || places[0];
    map.setView(place.center, zoomByScale[scale] || zoomByScale.city, { animate: false });
    const name = document.getElementById('theaterName');
    const region = document.getElementById('theaterRegion');
    if (name) name.textContent = place.name;
    if (region) region.textContent = place.region;
  }
  function populateLocations() {
    if (!scaleSelect || !locationSelect) return;
    const places = mapLocations[scaleSelect.value] || mapLocations.city;
    locationSelect.replaceChildren(...places.map((place, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = place.name;
      return option;
    }));
    updateMap();
  }
  scaleSelect?.addEventListener('change', populateLocations);
  locationSelect?.addEventListener('change', updateMap);
  document.getElementById('deploy')?.addEventListener('click', updateMap);
  document.getElementById('startGame')?.addEventListener('click', () => {
    requestAnimationFrame(() => { map.invalidateSize(); updateMap(); });
  });
  window.addEventListener('resize', () => map.invalidateSize());
  populateLocations();

  // Keep the basemap visible below the tactical canvas. OSM attribution stays
  // visible and clickable in its own overlay, regardless of tile load state.
  window.drawTerrain = function drawMapOverlay() {
    ctx.clearRect(0, 0, W, H);
    if (typeof naval !== 'undefined' && naval) {
      ctx.fillStyle = 'rgba(66,107,120,.58)'; ctx.fillRect(0, 0, W, 88);
      ctx.fillStyle = 'rgba(183,167,123,.72)'; ctx.fillRect(0, 88, W, 38);
    }
    ctx.strokeStyle = 'rgba(36,42,34,.10)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    if (typeof obstacles !== 'undefined') obstacles.forEach(o => {
      ctx.fillStyle = 'rgba(54,58,48,.84)'; ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = 'rgba(235,229,205,.72)'; ctx.strokeRect(o.x + 3, o.y + 3, o.w - 6, o.h - 6);
    });
  };
})();
