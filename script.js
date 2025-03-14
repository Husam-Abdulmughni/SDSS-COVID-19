// Initialize the map
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

// Load GeoJSON data for Maharashtra districts
let districtLayer;

fetch('data/Shapefile.geojson') // Ensure this path points to your Maharashtra shapefile
  .then(response => response.json())
  .then(data => {
    districtLayer = L.geoJSON(data, {
      style: { color: 'blue', weight: 2, fillOpacity: 0.1 },
      onEachFeature: (feature, layer) => {
        const districtName = feature.properties.district; // Replace 'district' with the correct property name
        $('#districtSelect').append(`<option value="${districtName}">${districtName}</option>`);

        // Add popup with district info
        layer.bindPopup(`<b>${districtName}</b>`);
      }
    }).addTo(map);
  });

// Handle district selection and highlight the selected district
$('#submitBtn').click(function () {
  const selectedDistrict = $('#districtSelect').val();
  districtLayer.eachLayer(layer => {
    if (layer.feature.properties.district === selectedDistrict) {
      map.fitBounds(layer.getBounds());
      layer.setStyle({ color: 'red', weight: 4, fillOpacity: 0.3 });
    } else {
      layer.setStyle({ color: 'blue', weight: 2, fillOpacity: 0.1 });
    }
  });
});