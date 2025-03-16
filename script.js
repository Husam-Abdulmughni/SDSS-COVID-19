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

// Load all GeoJSON files// Fix the Promise chain syntax
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

// Fix the event listener removal
document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['districtSelect', 'monthSelect', 'yearSelect'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const clone = element.cloneNode(true);
            element.parentNode.replaceChild(clone, element);
        }
    });
});

document.removeEventListener('DOMContentLoaded', () => {});

['districtSelect', 'monthSelect', 'yearSelect'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
    }
});

// Add this single event listener at the bottom of your file
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitBtn').addEventListener('click', () => {
        const selectedDistrict = document.getElementById('districtSelect').value;
        const selectedMonth = document.getElementById('monthSelect').value;
        const selectedYear = document.getElementById('yearSelect').value;
        
        if (!selectedDistrict) {
            alert('Please select a district');
            return;
        }
        
        // Reset previous state before highlighting new district
        if (currentPopup) {
            map.closePopup(currentPopup);
            currentPopup = null;
        }
        
        highlightDistrict(selectedDistrict, selectedMonth, selectedYear);
    });
});

// Keep only one getRiskColor function with consistent colors
function getRiskColor(risk) {
    switch(risk) {
        case 'High': return '#ff0000';    // Red
        case 'Medium': return '#ffff00';   // Yellow
        case 'Low': return '#008000';      // Green
        case 'No data': return '#808080';  // Gray
        default: return '#3498db';         // Blue
    }
}

// Event Listeners
// Remove the auto-update event listeners
// Remove the DOMContentLoaded event listener as it's causing issues
document.removeEventListener('DOMContentLoaded', () => {});

// Remove the existing event listener removal code
['districtSelect', 'monthSelect', 'yearSelect'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
    }
});

// Keep only one getRiskColor function and update colors to match the legend
function getRiskColor(risk) {
    switch(risk) {
        case 'High': return '#ff0000';    // Red
        case 'Medium': return '#ffff00';   // Yellow
        case 'Low': return '#008000';      // Green
        case 'No data': return '#808080';  // Gray
        default: return '#3498db';         // Blue
    }
}

// Update the button event listener
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