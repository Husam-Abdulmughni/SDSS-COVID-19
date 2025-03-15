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

// Variable to store the district layer
let districtLayer;

// Load the Maharashtra GeoJSON file and extract district names
fetch('Data/Maharashtra_base.geojson')
  .then(response => response.json())
  .then(data => {
    // Extract district names from the GeoJSON file
    const districts = data.features.map(feature => feature.properties.District);  // Changed from district to District
    
    // Sort districts alphabetically
    districts.sort();
    
    // Populate dropdown with district names
    populateDistrictDropdown(districts);

    // Add the district layer to the map
    districtLayer = L.geoJSON(data, {
      style: {
        color: 'blue',
        weight: 2,
        fillOpacity: 0.2
      },
      onEachFeature: (feature, layer) => {
        // Add a popup with the district name
        layer.bindPopup(`<b>${feature.properties.District}</b>`);  // Changed from district to District
      }
    }).addTo(map);

    // Fit the map view to Maharashtra boundaries
    map.fitBounds(districtLayer.getBounds());
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

// Update the highlightDistrict function
function highlightDistrict(selectedDistrict) {
  if (districtLayer) {
    districtLayer.setStyle({
      color: 'blue',
      weight: 2,
      fillOpacity: 0.2
    });
  }

  // Highlight the selected district
  districtLayer.eachLayer(layer => {
    if (layer.feature.properties.District === selectedDistrict) {  // Changed from district to District
      layer.setStyle({
        color: 'red',
        weight: 4,
        fillOpacity: 0.4
      });
      map.fitBounds(layer.getBounds());
    }
  });
}

// Handle the submit button click
document.getElementById('submitBtn').addEventListener('click', () => {
  const selectedDistrict = document.getElementById('districtSelect').value;
  highlightDistrict(selectedDistrict);
});