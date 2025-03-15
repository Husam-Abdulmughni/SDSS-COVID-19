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
let riskDataByYear = {};

// Load all GeoJSON files
Promise.all([
    fetch('Data/Maharashtra_base.geojson').then(response => response.json()),
    fetch('Data/Maharashtra_Riskmap_2020.geojson').then(response => response.json()),
    fetch('Data/Maharashtra_Riskmap_2021.geojson').then(response => response.json()),
    fetch('Data/Maharashtra_Riskmap_2022.geojson').then(response => response.json()),
    fetch('Data/Maharashtra_Riskmap_2023.geojson').then(response => response.json())
])
.then(([baseData, risk2020, risk2021, risk2022, risk2023]) => {
    // Store risk data by year
    riskDataByYear = {
        '2020': risk2020,
        '2021': risk2021,
        '2022': risk2022,
        '2023': risk2023
    };
    
    // Extract district names from the base GeoJSON file
    const districts = baseData.features.map(feature => feature.properties.District);
    districts.sort();
    
    // Populate dropdown with district names
    populateDistrictDropdown(districts);

    // Add the district layer to the map
    districtLayer = L.geoJSON(baseData, {
        style: {
            color: 'blue',
            weight: 2,
            fillOpacity: 0.2
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<b>${feature.properties.District}</b>`);
        }
    }).addTo(map);

    map.fitBounds(districtLayer.getBounds());
})
.catch(error => {
    console.error('Error loading data:', error);
    alert('Error loading data. Please check the console for details.');
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

// Function to get risk color
function getRiskColor(risk) {
    switch(risk) {
        case 'High': return 'red';
        case 'Medium': return 'yellow';
        case 'Low': return 'green';
        default: return 'blue';
    }
}

// Update the highlightDistrict function
function highlightDistrict(selectedDistrict, selectedMonth, selectedYear) {
    if (!districtLayer || !riskDataByYear[selectedYear]) return;

    // Reset all districts style
    districtLayer.setStyle({
        color: 'blue',
        weight: 2,
        fillOpacity: 0.2
    });

    // Find risk data for selected district and year
    const districtRiskData = riskDataByYear[selectedYear].features.find(
        feature => feature.properties.District === selectedDistrict
    );

    if (districtRiskData) {
        const risk = districtRiskData.properties[selectedMonth];
        const riskColor = getRiskColor(risk);

        // Highlight the selected district
        districtLayer.eachLayer(layer => {
            if (layer.feature.properties.District === selectedDistrict) {
                layer.setStyle({
                    color: riskColor,
                    weight: 4,
                    fillColor: riskColor,
                    fillOpacity: 0.6
                });
                layer.bindPopup(`
                    <b>${selectedDistrict}</b><br>
                    Year: ${selectedYear}<br>
                    Month: ${selectedMonth}<br>
                    Risk Level: ${risk || 'No data'}
                `).openPopup();
                map.fitBounds(layer.getBounds());
            }
        });
    }
}

// Update the submit button click handler
document.getElementById('submitBtn').addEventListener('click', () => {
    const selectedDistrict = document.getElementById('districtSelect').value;
    const selectedMonth = document.getElementById('monthSelect').value;
    const selectedYear = document.getElementById('yearSelect').value;
    highlightDistrict(selectedDistrict, selectedMonth, selectedYear);
});