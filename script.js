// Initialize the map and set the view to Maharashtra
const map = L.map('map').setView([19.7515, 75.7139], 6); // Centered on Maharashtra

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

// Load study area GeoJSON
let studyAreaLayer;

fetch('data/Shapefile.geojson') // Update the path to your GeoJSON file
  .then(response => response.json())
  .then(data => {
    studyAreaLayer = L.geoJSON(data, {
      style: { color: 'green', weight: 2, fillOpacity: 0.1 },
      onEachFeature: (feature, layer) => {
        const districtName = feature.properties.District.trim(); // Trim to remove extra spaces or newlines
        // Add district name to the dropdown
        $('#districtSelect').append(`<option value="${districtName}">${districtName}</option>`);

        // Add popup with district info
        layer.bindPopup(`<b>${districtName}</b>`);
      }
    }).addTo(map);

    // Fit the map to the bounds of the study area
    map.fitBounds(studyAreaLayer.getBounds());
  })
  .catch(error => console.error('Error loading GeoJSON:', error));

// Handle district selection
$('#submitBtn').click(function () {
  const selectedDistrict = $('#districtSelect').val();
  if (!selectedDistrict) return; // Do nothing if no district is selected

  studyAreaLayer.eachLayer(layer => {
    if (layer.feature.properties.District.trim() === selectedDistrict) {
      // Zoom to the selected district
      map.fitBounds(layer.getBounds());
      // Highlight the selected district
      layer.setStyle({ color: 'red', weight: 4, fillOpacity: 0.3 });
    } else {
      // Reset the style for other districts
      layer.setStyle({ color: 'green', weight: 2, fillOpacity: 0.1 });
    }
  });
});