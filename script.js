// Initialize the map
const map = L.map('map').setView([19.7515, 75.7139], 7);

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

// Variables to store layers and data
let districtLayer;
let riskDataByYear = {};
let currentPopup = null;

// Load all GeoJSON files
Promise.all([
    fetch('Data/Maharashtra_base.geojson').then(response => {
        if (!response.ok) throw new Error('Failed to load base map');
        return response.json();
    }),
    fetch('Data/Maharashtra_Riskmap_2020.geojson').then(response => {
        if (!response.ok) throw new Error('Failed to load 2020 data');
        return response.json();
    }),
    fetch('Data/Maharashtra_Riskmap_2021.geojson').then(response => {
        if (!response.ok) throw new Error('Failed to load 2021 data');
        return response.json();
    }),
    fetch('Data/Maharashtra_Riskmap_2022.geojson').then(response => {
        if (!response.ok) throw new Error('Failed to load 2022 data');
        return response.json();
    }),
    fetch('Data/Maharashtra_Riskmap_2023.geojson').then(response => {
        if (!response.ok) throw new Error('Failed to load 2023 data');
        return response.json();
    })
])
.then(([baseData, risk2020, risk2021, risk2022, risk2023]) => {
    riskDataByYear = {
        '2020': risk2020,
        '2021': risk2021,
        '2022': risk2022,
        '2023': risk2023
    };
    
    const districts = baseData.features.map(feature => feature.properties.District);
    districts.sort();
    
    populateDistrictDropdown(districts);

    districtLayer = L.geoJSON(baseData, {
        style: {
            color: '#2c3e50',
            weight: 2,
            fillOpacity: 0.2,
            fillColor: '#3498db'
        },
        onEachFeature: (feature, layer) => {
            layer.on({
                mouseover: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 3,
                        fillOpacity: 0.3
                    });
                },
                mouseout: (e) => {
                    districtLayer.resetStyle(e.target);
                },
 changes                // Remove the click event that was auto-selecting districts
                click: (e) => {
                    layer.bindPopup(`<b>${e.target.feature.properties.District}</b>`).openPopup();
                }
            });
        }
    }).addTo(map);

    map.fitBounds(districtLayer.getBounds());
})
.catch(error => {
    console.error('Error loading data:', error);
    alert(`Error: ${error.message}. Please check your internet connection and try again.`);
});

function populateDistrictDropdown(districts) {
    const districtSelect = document.getElementById('districtSelect');
    districtSelect.innerHTML = '<option value="">--Select a district--</option>';
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
}

function highlightDistrict(selectedDistrict, selectedMonth, selectedYear) {
    if (!selectedDistrict) {
        alert('Please select a district');
        return;
    }

    if (!districtLayer || !riskDataByYear[selectedYear]) return;

    districtLayer.setStyle({
        color: '#2c3e50',
        weight: 2,
        fillOpacity: 0.2,
        fillColor: '#3498db'
    });

    const districtRiskData = riskDataByYear[selectedYear].features.find(
        feature => feature.properties.District === selectedDistrict
    );

    if (districtRiskData) {
        const risk = districtRiskData.properties[selectedMonth];
        let displayRisk = risk;
        
        if (selectedYear === '2020' && ['January', 'February', 'March'].includes(selectedMonth)) {
            displayRisk = 'No data';
        }

        const riskColor = getRiskColor(displayRisk);

        districtLayer.eachLayer(layer => {
            if (layer.feature.properties.District === selectedDistrict) {
                layer.setStyle({
                    color: '#34495e',
                    weight: 4,
                    fillColor: riskColor,
                    fillOpacity: 0.7
                });
                
                if (currentPopup) {
                    map.closePopup(currentPopup);
                }

                const popupContent = `
                    <div class="popup-content">
                        <h3>${selectedDistrict}</h3>
                        <p><strong>Year:</strong> ${selectedYear}</p>
                        <p><strong>Month:</strong> ${selectedMonth}</p>
                        <p><strong>Risk Level:</strong> <span style="color:${riskColor}">${displayRisk}</span></p>
                    </div>
                `;
                
                currentPopup = layer.bindPopup(popupContent, {
                    closeButton: true,
                    className: 'custom-popup'
                }).openPopup();

                map.fitBounds(layer.getBounds(), {
                    padding: [50, 50]
                });
            }
        });
    }
}

function getRiskColor(risk) {
    switch(risk) {
        case 'High': return '#e74c3c';
        case 'Medium': return '#f1c40f';
        case 'Low': return '#2ecc71';
        case 'No data': return '#95a5a6';
        default: return '#3498db';
    }
}

// Event Listeners
// Remove the auto-update event listeners
['districtSelect', 'monthSelect', 'yearSelect'].forEach(id => {
    document.getElementById(id).removeEventListener('change');
});

// Keep only the submit button event listener
document.getElementById('submitBtn').addEventListener('click', () => {
    const selectedDistrict = document.getElementById('districtSelect').value;
    const selectedMonth = document.getElementById('monthSelect').value;
    const selectedYear = document.getElementById('yearSelect').value;
    
    if (!selectedDistrict) {
        alert('Please select a district');
        return;
    }
    highlightDistrict(selectedDistrict, selectedMonth, selectedYear);
});

// Modify the initial district layer setup
districtLayer = L.geoJSON(baseData, {
    style: {
        color: '#2c3e50',
        weight: 2,
        fillOpacity: 0.2,
        fillColor: '#3498db'
    },
    onEachFeature: (feature, layer) => {
        // Only show district name on hover
        layer.bindPopup(`<b>${feature.properties.District}</b>`);
    }
}).addTo(map);