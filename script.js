// Initialize the map
const map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India

// Add base layers
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: '© Esri'
});

// Add layer control
const baseLayers = {
  "OpenStreetMap": osm,
  "Satellite": satellite
};
L.control.layers(baseLayers).addTo(map);

// Load the shapefile (GeoJSON) and extract district names
fetch('Data/Shapefile.geojson')
  .then(response => response.json())
  .then(data => {
    const districts = data.features.map(feature => feature.properties.district); // Replace 'district' with the correct property name
    populateDistrictDropdown(districts);

    // Add the district layer to the map
    districtLayer = L.geoJSON(data, {
      style: { color: 'blue', weight: 2 },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<b>${feature.properties.district}</b>`); // Replace 'district' with the correct property name
      }
    }).addTo(map);
  })
  .catch(error => console.error('Error loading GeoJSON:', error));

// Function to populate the district dropdown
function populateDistrictDropdown(districts) {
  const districtSelect = document.getElementById('districtSelect');
  districts.forEach(district => {
    const option = document.createElement('option');
    option.value = district;
    option.textContent = district;
    districtSelect.appendChild(option);
  });
}

// Function to highlight the selected district
function highlightDistrict(selectedDistrict) {
  if (districtLayer) {
    districtLayer.setStyle({ color: 'blue', weight: 2 }); // Reset the style of previously highlighted district
  }

  districtLayer.eachLayer(layer => {
    if (layer.feature.properties.district === selectedDistrict) { // Replace 'district' with the correct property name
      layer.setStyle({ color: 'red', weight: 4 }); // Highlight the selected district
      districtLayer = layer; // Store the highlighted layer
      map.fitBounds(layer.getBounds()); // Zoom to the selected district
    }
  });
}

// Handle the submit button click
document.getElementById('submitBtn').addEventListener('click', () => {
  const selectedDistrict = document.getElementById('districtSelect').value;
  highlightDistrict(selectedDistrict);
});