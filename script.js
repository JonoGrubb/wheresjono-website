// Initialize the map in the #map div
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  maxZoom: 19
}).addTo(map);

// Create a star icon for current location
const starIcon = L.divIcon({
  html: '⭐',
  className: 'star-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Load both files and process after both are loaded
Promise.all([
  fetch('data/currentLocation.json').then(response => response.json()),
  fetch('data/locations.json').then(response => response.json())
])
.then(([currentLocation, locations]) => {
  // Add current location marker first
  const currentLocationMarker = L.marker([currentLocation.lat, currentLocation.lng], {
    icon: starIcon,
    zIndexOffset: 1000
  }).addTo(map);
  
  currentLocationMarker.bindPopup(
    `<strong>${currentLocation.name}</strong><br>
    ${currentLocation.description}<br>
    Last updated: ${new Date(currentLocation.lastUpdate).toLocaleDateString()}`
  );

  // Add other locations, checking for overlap
  locations.forEach(location => {
    const currentLatLng = currentLocationMarker.getLatLng();
    const distance = currentLatLng.distanceTo(L.latLng(location.lat, location.lng));
    
    console.log(`Distance from current location to ${location.name}: ${distance.toFixed(2)}m`);
    
    // Only add marker if it's not too close
    if (distance >= 25000) {
      const marker = L.marker([location.lat, location.lng]).addTo(map);
      marker.bindPopup(`<strong>${location.name}</strong><br>${location.description}`);
    } else {
      console.log(`Skipping marker for ${location.name} - too close to current location`);
    }
  });
})
.catch(error => {
  console.error('Error loading data:', error);
});