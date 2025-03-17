// Show loading spinner
function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

// Hide loading spinner
function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

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

// Show loading spinner before fetching data
showLoadingSpinner();

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
})
.finally(() => {
    // Hide loading spinner after data is loaded or if there's an error
    hideLoadingSpinner();
});

// Rest of your JavaScript code remains unchanged...