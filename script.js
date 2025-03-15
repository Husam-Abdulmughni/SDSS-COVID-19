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

// Load Maharashtra districts GeoJSON
let districtLayer;

fetch('data/Shapefile.geojson') // Update the path to your GeoJSON file
  .then(response => response.json())
  .then(data => {
    districtLayer = L.geoJSON(data, {
      style: { color: 'blue', weight: 2, fillOpacity: 0.1 },
      onEachFeature: (feature, layer) => {
        const districtName = feature.properties.District; // Use 'District' (capitalized)
        // Add district name to the dropdown
        $('#districtSelect').append(`<option value="${districtName}">${districtName}</option>`);

        // Add popup with district info
        layer.bindPopup(`<b>${districtName}</b>`);
      }
    }).addTo(map);

    // Fit the map to the bounds of Maharashtra
    map.fitBounds(districtLayer.getBounds());
  })
  .catch(error => console.error('Error loading GeoJSON:', error));

// Handle district selection
$('#submitBtn').click(function () {
  const selectedDistrict = $('#districtSelect').val();
  if (!selectedDistrict) return; // Do nothing if no district is selected

  districtLayer.eachLayer(layer => {
    if (layer.feature.properties.District === selectedDistrict) {
      // Zoom to the selected district
      map.fitBounds(layer.getBounds());
      // Highlight the selected district
      layer.setStyle({ color: 'red', weight: 4, fillOpacity: 0.3 });
    } else {
      // Reset the style for other districts
      layer.setStyle({ color: 'blue', weight: 2, fillOpacity: 0.1 });
    }
  });
});