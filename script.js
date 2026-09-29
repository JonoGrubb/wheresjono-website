// CARTO Positron vector style (English labels when zoomed out).
// Vector basemaps don't need a CARTO API key yet; CARTO has said they will in future.
const POSITRON_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// Initialize the map in the #map div - we'll set the view after loading current location
const map = new maplibregl.Map({
  container: 'map',
  style: POSITRON_STYLE,
  center: [0, 20],
  zoom: 1.5
});

map.addControl(new maplibregl.NavigationControl());

// Show the world as a globe when zoomed out; it flattens as you zoom in
map.on('style.load', () => {
  map.setProjection({ type: 'globe' });
});

// Markers on the far side of the globe show faintly when zoomed out, but are
// hidden when zoomed in so they don't clutter the map (see style.css)
const HIDE_COVERED_MARKERS_ZOOM = 3;
function updateCoveredMarkers() {
  map.getContainer().classList.toggle('hide-covered-markers', map.getZoom() >= HIDE_COVERED_MARKERS_ZOOM);
}
map.on('zoom', updateCoveredMarkers);

// Create a star element for the current location marker
function createStarElement() {
  const el = document.createElement('div');
  el.className = 'star-icon';
  el.innerHTML = '<span>⭐</span>';
  return el;
}

// Load both files and process after both are loaded
Promise.all([
  fetch('data/currentLocation.json').then(response => response.json()),
  fetch('data/locations.json').then(response => response.json())
])
.then(([currentLocation, locations]) => {
  const currentLngLat = new maplibregl.LngLat(currentLocation.lng, currentLocation.lat);

  // Center on current location, zoomed out enough to see the globe
  map.jumpTo({ center: currentLngLat, zoom: 1.8 });

  // Add other locations first so the star draws on top of them
  locations.forEach(location => {
    const lngLat = new maplibregl.LngLat(location.lng, location.lat);

    // Only add marker if it's not too close to the current location
    if (currentLngLat.distanceTo(lngLat) < 25000) {
      return;
    }

    new maplibregl.Marker({ color: '#3b82f6', scale: 0.7 })
      .setLngLat(lngLat)
      .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(
        `<strong>${location.name}</strong><br>${location.description}`
      ))
      .addTo(map);
  });

  new maplibregl.Marker({ element: createStarElement(), anchor: 'center' })
    .setLngLat(currentLngLat)
    .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(
      `<strong>${currentLocation.name}</strong><br>${currentLocation.description}`
    ))
    .addTo(map);
})
.catch(error => {
  console.error('Error loading data:', error);
});
