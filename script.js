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

// Load GeoJSON data
let districtLayer;
let hospitalLayer;
let hospitalBufferLayer;

fetch('data/Shapefile.geojson')
  .then(response => response.json())
  .then(data => {
    districtLayer = L.geoJSON(data, {
      style: { color: 'blue', weight: 2 },
      onEachFeature: (feature, layer) => {
        // Add district name to the dropdown
        const districtName = feature.properties.district; // Replace 'district' with the correct property name
        $('#districtSelect').append(`<option value="${districtName}">${districtName}</option>`);

        // Add popup with district info
        layer.bindPopup(`<b>${districtName}</b><br>COVID-19 Cases: ${feature.properties.cases}`); // Replace 'cases' with the correct property name
      }
    }).addTo(map);
  });

fetch('data/Healthcare.geojson')
  .then(response => response.json())
  .then(data => {
    hospitalLayer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, { radius: 5, color: 'red' });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<b>Hospital:</b> ${feature.properties.name}`); // Replace 'name' with the correct property name
      }
    });
  });

fetch('data/Healthcare_Buffer.geojson')
  .then(response => response.json())
  .then(data => {
    hospitalBufferLayer = L.geoJSON(data, {
      style: { color: 'green', weight: 2 }
    });
  });

// Handle district selection
$('#districtSelect').change(function () {
  const selectedDistrict = $(this).val();
  districtLayer.eachLayer(layer => {
    if (layer.feature.properties.district === selectedDistrict) {
      map.fitBounds(layer.getBounds());
    }
  });
});

// Handle submit button
$('#submitBtn').click(function () {
  const district = $('#districtSelect').val();
  const year = $('#yearSelect').val();
  const month = $('#monthSelect').val();

  // Update the table with data (mock data for now)
  $('#dataTable tbody').html(`
    <tr>
      <td>${district}</td>
      <td>${year}</td>
      <td>${month}</td>
      <td>1000</td> <!-- Replace with actual data -->
      <td>50</td> <!-- Replace with actual data -->
      <td>500</td> <!-- Replace with actual data -->
    </tr>
  `);
});