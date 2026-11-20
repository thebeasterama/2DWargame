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
  if (!mapElement || !window.L) {
    console.warn('Real-world map tiles unavailable: Leaflet could not be loaded.');
    return;
  }

  const map = L.map(mapElement, {
    zoomControl: false,
    attributionControl: true,
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false
  }).setView(mapLocations.city[0].center, zoomByScale.city);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  function updateMap() {
    const scaleSelect = document.getElementById('mapScale');
    const locationSelect = document.getElementById('location');
    if (!scaleSelect || !locationSelect) return;
    const scale = scaleSelect.value;
    const index = Number(locationSelect.value) || 0;
    const place = (mapLocations[scale] || mapLocations.city)[index] || mapLocations.city[0];
    map.setView(place.center, zoomByScale[scale] || zoomByScale.city, { animate: false });
    const name = document.getElementById('theaterName');
    const region = document.getElementById('theaterRegion');
    if (name) name.textContent = place.name;
    if (region) region.textContent = `${place.region} · © OpenStreetMap`;
  }

  document.getElementById('mapScale')?.addEventListener('change', updateMap);
  document.getElementById('location')?.addEventListener('change', updateMap);
  document.getElementById('deploy')?.addEventListener('click', updateMap);
  document.getElementById('startGame')?.addEventListener('click', () => {
    requestAnimationFrame(() => { map.invalidateSize(); updateMap(); });
  });

  // Keep the basemap visible beneath the game units, obstacles, and effects.
  window.drawTerrain = function drawRealWorldOverlay() {
    ctx.clearRect(0, 0, W, H);
    if (naval) {
      ctx.fillStyle = 'rgba(66,107,120,.72)';
      ctx.fillRect(0, 0, W, 88);
      ctx.fillStyle = 'rgba(183,167,123,.86)';
      ctx.fillRect(0, 88, W, 38);
    }
    ctx.strokeStyle = 'rgba(36,42,34,.10)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    obstacles.forEach(o => {
      ctx.fillStyle = 'rgba(54,58,48,.84)';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = 'rgba(235,229,205,.72)';
      ctx.strokeRect(o.x + 3, o.y + 3, o.w - 6, o.h - 6);
    });
  };

  updateMap();
})();
