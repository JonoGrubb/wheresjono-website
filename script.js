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
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

// Fetch and display current location
fetch('data/currentLocation.json')
  .then(response => response.json())
  .then(currentLocation => {
    const marker = L.marker([currentLocation.lat, currentLocation.lng], {
      icon: starIcon
    }).addTo(map);
    marker.bindPopup(
      `<strong>${currentLocation.name}</strong><br>
      ${currentLocation.description}<br>
      Last updated: ${new Date(currentLocation.lastUpdate).toLocaleDateString()}`
    );
  })
  .catch(error => {
    console.error('Error loading current location:', error);
  });

// Fetch location history
fetch('data/locations.json')
  .then(response => response.json())
  .then(locations => {
    locations.forEach(location => {
      // Create a marker
      const marker = L.marker([location.lat, location.lng]).addTo(map);
      // Attach a popup
      marker.bindPopup(`<strong>${location.name}</strong><br>${location.description}`);
    });
  })
  .catch(error => {
    console.error('Error loading locations:', error);
  });