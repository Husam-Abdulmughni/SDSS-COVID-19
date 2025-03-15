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
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('GeoJSON data:', data); // Debug: Check loaded data
    
    if (!data.features || !data.features.length) {
      throw new Error('No features found in GeoJSON');
    }

    // Extract district names from the GeoJSON file
    const districts = data.features.map(feature => {
      console.log('Feature properties:', feature.properties); // Debug: Check each feature
      return feature.properties.District;
    }).filter(district => district); // Remove any undefined or null values
    
    console.log('Extracted districts:', districts); // Debug: Check extracted districts
    
    // Sort districts alphabetically
    districts.sort();
    
    // Clear existing options in dropdown
    const districtSelect = document.getElementById('districtSelect');
    districtSelect.innerHTML = '<option value="">--Select a district--</option>';
    
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
        layer.bindPopup(`<b>${feature.properties.District}</b>`);
      }
    }).addTo(map);

    // Fit the map view to Maharashtra boundaries
    map.fitBounds(districtLayer.getBounds());
  })
  .catch(error => {
    console.error('Error loading or processing GeoJSON:', error);
    alert('Error loading district data. Please check the console for details.');
  });

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