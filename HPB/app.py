from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import random

app = Flask(__name__)
CORS(app)

# ============ CROP DATABASE ============
CROP_DATA = {
    "wheat": {"temp_min": 10, "temp_max": 25, "rainfall": "moderate", "soils": ["loamy", "clay"], "fertilizer": "Urea + DAP", "base_qty": 50},
    "rice": {"temp_min": 20, "temp_max": 35, "rainfall": "high", "soils": ["clay", "loamy"], "fertilizer": "NPK + Urea", "base_qty": 60},
    "tomato": {"temp_min": 15, "temp_max": 30, "rainfall": "moderate", "soils": ["loamy", "sandy"], "fertilizer": "NPK 10-10-10", "base_qty": 30},
    "mango": {"temp_min": 24, "temp_max": 40, "rainfall": "moderate", "soils": ["loamy", "sandy"], "fertilizer": "NPK + Potash", "base_qty": 40},
    "potato": {"temp_min": 10, "temp_max": 25, "rainfall": "moderate", "soils": ["sandy", "loamy"], "fertilizer": "NPK 12-12-17", "base_qty": 45},
    "cotton": {"temp_min": 20, "temp_max": 35, "rainfall": "low", "soils": ["clay", "loamy"], "fertilizer": "Urea + SSP", "base_qty": 55},
    "sugarcane": {"temp_min": 20, "temp_max": 40, "rainfall": "high", "soils": ["loamy", "clay"], "fertilizer": "NPK + Zinc", "base_qty": 70},
    "onion": {"temp_min": 13, "temp_max": 28, "rainfall": "low", "soils": ["sandy", "loamy"], "fertilizer": "NPK 19-19-19", "base_qty": 25},
}

# ============ INDIAN CITIES ============
CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Patna", "Vadodara",
    "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar"
]

# ============ WEATHER API ============
def get_weather(city):
    """Get weather data from Open-Meteo API (free, no API key needed)"""
    try:
        # First get coordinates
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"
        geo_resp = requests.get(geo_url).json()
        
        if "results" not in geo_resp:
            return None
            
        lat = geo_resp["results"][0]["latitude"]
        lon = geo_resp["results"][0]["longitude"]
        
        # Get weather forecast
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto"
        weather_resp = requests.get(weather_url).json()
        
        daily = weather_resp["daily"]
        avg_temp = (daily["temperature_2m_max"][0] + daily["temperature_2m_min"][0]) / 2
        rainfall_prob = daily["precipitation_probability_max"][0]
        
        # Determine rainfall level and drought risk
        if rainfall_prob > 60:
            rainfall = "high"
            drought = "Low"
        elif rainfall_prob > 30:
            rainfall = "moderate"
            drought = "Medium"
        else:
            rainfall = "low"
            drought = "High"
            
        return {
            "temperature": round(avg_temp, 1),
            "rainfall": rainfall,
            "rainfall_prob": rainfall_prob,
            "drought": drought
        }
    except Exception as e:
        print(f"Weather API error: {e}")
        return None

# ============ RECOMMENDATION ENGINE ============
def get_recommendations(city, soil_type, land_size, weather):
    """Simple ML-like recommendation based on conditions"""
    recommendations = []
    soil = soil_type.lower()
    temp = weather["temperature"]
    rainfall = weather["rainfall"]
    
    for crop, data in CROP_DATA.items():
        score = 0
        reasons = []
        
        # Check temperature suitability
        if data["temp_min"] <= temp <= data["temp_max"]:
            score += 3
            reasons.append(f"Temperature {temp}C is ideal for {crop}")
        elif data["temp_min"] - 5 <= temp <= data["temp_max"] + 5:
            score += 1
            reasons.append(f"Temperature {temp}C is acceptable for {crop}")
        
        # Check soil compatibility
        if soil in data["soils"]:
            score += 3
            reasons.append(f"{soil.capitalize()} soil is excellent for {crop}")
        
        # Check rainfall compatibility
        if data["rainfall"] == rainfall:
            score += 2
            reasons.append(f"{rainfall.capitalize()} rainfall matches {crop} needs")
        
        # Add if score is good enough
        if score >= 4:
            quantity = data["base_qty"] * land_size
            recommendations.append({
                "crop": crop.capitalize(),
                "fertilizer": data["fertilizer"],
                "quantity": f"{quantity} kg",
                "temperature": f"{temp}C",
                "rainfall": rainfall.capitalize(),
                "drought": weather["drought"],
                "score": score,
                "reason": " | ".join(reasons) + " | Good market demand expected."
            })
    
    # Sort by score and return top 6
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:6]

# ============ API ROUTES ============
@app.route("/cities", methods=["GET"])
def get_cities():
    """Return list of cities for autocomplete"""
    query = request.args.get("q", "").lower()
    filtered = [c for c in CITIES if query in c.lower()]
    return jsonify(filtered[:10])

@app.route("/recommend", methods=["POST"])
def recommend():
    """Main recommendation endpoint"""
    data = request.json
    city = data.get("city", "")
    soil_type = data.get("soil_type", "")
    land_size = float(data.get("land_size", 1))
    
    # Validate inputs
    if not city or not soil_type:
        return jsonify({"error": "City and soil type are required"}), 400
    
    # Get weather data
    weather = get_weather(city)
    if not weather:
        return jsonify({"error": "Could not fetch weather data"}), 500
    
    # Get recommendations
    recommendations = get_recommendations(city, soil_type, land_size, weather)
    
    return jsonify({
        "weather": weather,
        "recommendations": recommendations
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)