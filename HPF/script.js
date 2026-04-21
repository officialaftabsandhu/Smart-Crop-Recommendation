
const API_URL = "http://localhost:5000";

// Real crop images from Unsplash
const CROP_IMAGES = {
    wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=200&fit=crop",
    rice: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=200&fit=crop",
    tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=200&fit=crop",
    mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=200&fit=crop",
    potato: "https://images.unsplash.com/photo-1518977676601-b53f82ber69?w=400&h=200&fit=crop",
    cotton: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=400&h=200&fit=crop",
    sugarcane: "https://images.unsplash.com/photo-1527847263472-aa5338d178b8?w=400&h=200&fit=crop",
    onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=200&fit=crop",
    default: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=200&fit=crop"
};

// DOM Elements
const cityInput = document.getElementById("cityInput");
const suggestions = document.getElementById("suggestions");
const soilType = document.getElementById("soilType");
const landSize = document.getElementById("landSize");
const getRecommendationsBtn = document.getElementById("getRecommendations");
const weatherCard = document.getElementById("weatherCard");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const resultsSection = document.getElementById("resultsSection");
const cardsGrid = document.getElementById("cardsGrid");
const bgImage = document.getElementById("bgImage");

let debounceTimer;
let currentCity = "";

// City Autocomplete
cityInput.addEventListener("input", function() {
    clearTimeout(debounceTimer);
    const query = this.value.trim();
    
    if (query.length < 1) {
        suggestions.classList.remove("active");
        return;
    }
    
    debounceTimer = setTimeout(() => fetchCities(query), 300);
});

async function fetchCities(query) {
    try {
        const response = await fetch(`${API_URL}/cities?q=${query}`);
        const cities = await response.json();
        
        if (cities.length > 0) {
            suggestions.innerHTML = cities
                .map(city => `<div class="suggestion-item">${city}</div>`)
                .join("");
            suggestions.classList.add("active");
            
            document.querySelectorAll(".suggestion-item").forEach(item => {
                item.addEventListener("click", function() {
                    cityInput.value = this.textContent;
                    currentCity = this.textContent;
                    suggestions.classList.remove("active");
                    updateBackground(this.textContent);
                });
            });
        } else {
            suggestions.classList.remove("active");
        }
    } catch (error) {
        console.error("Error fetching cities:", error);
    }
}

document.addEventListener("click", function(e) {
    if (!e.target.closest(".autocomplete-wrapper")) {
        suggestions.classList.remove("active");
    }
});

function updateBackground(city) {
    const imageUrl = `https://source.unsplash.com/1920x1080/?${city},agriculture,landscape`;
    bgImage.style.backgroundImage = `url(${imageUrl})`;
}

// Get Recommendations
getRecommendationsBtn.addEventListener("click", async function() {
    const city = cityInput.value.trim();
    const soil = soilType.value;
    const land = parseFloat(landSize.value);
    
    if (!city) { showError("Please enter a city name"); return; }
    if (!soil) { showError("Please select soil type"); return; }
    if (!land || land <= 0) { showError("Please enter valid land size"); return; }
    
    currentCity = city;
    hideError();
    weatherCard.classList.add("hidden");
    resultsSection.classList.add("hidden");
    loading.classList.remove("hidden");
    
    try {
        const response = await fetch(`${API_URL}/recommend`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ city, soil_type: soil, land_size: land })
        });
        
        const data = await response.json();
        
        if (data.error) { showError(data.error); return; }
        
        displayWeather(data.weather, city);
        displayRecommendations(data.recommendations);
        
    } catch (error) {
        console.error("Error:", error);
        showError("Failed to connect to server. Make sure the backend is running.");
    } finally {
        loading.classList.add("hidden");
    }
});

function displayWeather(weather, city) {
    document.getElementById("tempValue").textContent = weather.temperature + " C";
    document.getElementById("rainValue").textContent = weather.rainfall.charAt(0).toUpperCase() + weather.rainfall.slice(1);
    document.getElementById("droughtValue").textContent = weather.drought;
    document.getElementById("cityName").textContent = city;
    
    const droughtEl = document.getElementById("droughtValue");
    droughtEl.className = "weather-value drought-" + weather.drought.toLowerCase();
    
    weatherCard.classList.remove("hidden");
}

function displayRecommendations(recommendations) {
    if (recommendations.length === 0) {
        showError("No suitable crops found for your conditions.");
        return;
    }
    
    cardsGrid.innerHTML = recommendations.map(rec => createCard(rec)).join("");
    resultsSection.classList.remove("hidden");
    
    document.querySelectorAll(".btn-why").forEach(btn => {
        btn.addEventListener("click", function() {
            this.closest(".flip-card").classList.add("flipped");
        });
    });
    
    document.querySelectorAll(".btn-back").forEach(btn => {
        btn.addEventListener("click", function() {
            this.closest(".flip-card").classList.remove("flipped");
        });
    });
}

function createCard(rec) {
    const cropLower = rec.crop.toLowerCase();
    const imageUrl = CROP_IMAGES[cropLower] || CROP_IMAGES.default;
    const smallImage = imageUrl.replace("w=400&h=200", "w=60&h=60");
    
    const reasons = rec.reason.split(" | ").map(r => `<p>${r}</p>`).join("");
    
    return `
        <div class="flip-card">
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <div class="crop-image">
                        <img src="${imageUrl}" alt="${rec.crop}">
                        <span class="crop-badge">Recommended</span>
                    </div>
                    <div class="card-content">
                        <div class="crop-name">${rec.crop}</div>
                        <div class="card-info">
                            <div class="info-row">
                                <span class="info-label">Fertilizer</span>
                                <span class="info-value">${rec.fertilizer}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Quantity</span>
                                <span class="info-value">${rec.quantity}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Temperature</span>
                                <span class="info-value">${rec.temperature}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Drought Risk</span>
                                <span class="info-value drought-${rec.drought.toLowerCase()}">${rec.drought}</span>
                            </div>
                        </div>
                        <button class="btn-why">Why this crop?</button>
                    </div>
                </div>
                <div class="flip-card-back">
                    <div class="back-header">
                        <img src="${smallImage}" alt="${rec.crop}">
                        <div>
                            <div class="back-title">Why ${rec.crop}?</div>
                            <div class="back-subtitle">AI Analysis</div>
                        </div>
                    </div>
                    <div class="reason-text">${reasons}</div>
                    <button class="btn-back">Back to details</button>
                </div>
            </div>
        </div>
    `;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function hideError() {
    errorMessage.classList.add("hidden");
}

updateBackground("agriculture field sunset");