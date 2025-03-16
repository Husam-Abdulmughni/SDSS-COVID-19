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

// Add loading indicator
const loadingIndicator = document.getElementById('loading');
if (!loadingIndicator) {
    const loader = document.createElement('div');
    loader.id = 'loading';
    loader.innerHTML = 'Loading data...';
    document.body.appendChild(loader);
}

// Load all GeoJSON files
loadingIndicator.style.display = 'block';
Promise.all([
    fetch('Data/Maharashtra_base.geojson').then(response => response.json()),
    fetch('Data/Maharashtra_Riskmap_2020.geojson').then(response => response.json()),
    fetch('Data/Maharashtra_Riskmap_2021.geojson').then(response => response.json()),
    fetch('Data/Maharashtra_Riskmap_2022.geojson').then(response => response.json()),
    fetch('Data/Maharashtra_Riskmap_2023.geojson').then(response => response.json())
])
.then(([baseData, risk2020, risk2021, risk2022, risk2023]) => {
    loadingIndicator.style.display = 'none';
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
    loadingIndicator.style.display = 'none';
    console.error('Error loading data:', error);
    alert('Error loading data. Please try refreshing the page.');
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
        let displayRisk = risk;
        
        // Special handling for 2020's first three months
        if (selectedYear === '2020' && ['January', 'February', 'March'].includes(selectedMonth)) {
            displayRisk = 'No data';
        }

        const riskColor = getRiskColor(displayRisk);

        // Highlight the selected district
        districtLayer.eachLayer(layer => {
            if (layer.feature.properties.District === selectedDistrict) {
                layer.setStyle({
                    color: riskColor,
                    weight: 4,
                    fillColor: riskColor,
                    fillOpacity: 0.6
                });
                
                // Create popup content
                const popupContent = `
                    <b>${selectedDistrict}</b><br>
                    Year: ${selectedYear}<br>
                    Month: ${selectedMonth}<br>
                    Risk Level: ${displayRisk}
                `;
                
                layer.bindPopup(popupContent).openPopup();
                map.fitBounds(layer.getBounds());
            }
        });
    }
}

// Update getRiskColor function to handle 'no data' case
function getRiskColor(risk) {
    switch(risk) {
        case 'High': return 'red';
        case 'Medium': return 'yellow';
        case 'Low': return 'green';
        case 'No data': return 'gray';
        default: return 'blue';
    }
}

// Update the submit button click handler
document.getElementById('submitBtn').addEventListener('click', () => {
    const selectedDistrict = document.getElementById('districtSelect').value;
    const selectedMonth = document.getElementById('monthSelect').value;
    const selectedYear = document.getElementById('yearSelect').value;
    highlightDistrict(selectedDistrict, selectedMonth, selectedYear);
});