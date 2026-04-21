# 🌾 Precision Farming - AI Decision Support System

## 📌 Overview
Precision Farming is a web-based AI-powered Decision Support System (DSS) that helps farmers choose the most suitable crops based on:

- 🌍 Location (City)
- 🌱 Soil Type
- 📏 Land Size
- 🌦️ Real-time Weather Data

The system analyzes environmental conditions and provides smart crop recommendations including fertilizer suggestions, quantity, and reasoning.

---

## 🚀 Features

- 🔍 City Autocomplete
- 🌦️ Real-time Weather Integration (Open-Meteo API)
- 🌱 Soil-based Crop Matching
- 🤖 AI-like Recommendation Engine
- 📊 Detailed Crop Insights
- 🎴 Interactive Flip Cards UI
- 🎨 Modern Responsive Design

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- Flask
- Flask-CORS

### APIs
- Open-Meteo API
- Open-Meteo Geocoding API

---

## 📂 Project Structure

Precision-Farming/
│
├── index.html
├── style.css
├── script.js
├── app.py
└── README.md

---

## ⚙️ Installation & Setup

### 1. Clone Repository
git clone https://github.com/your-username/precision-farming.git
cd precision-farming

### 2. Install Dependencies
pip install flask flask-cors requests

### 3. Run Backend
python app.py

Server runs on:
http://localhost:5000

### 4. Run Frontend
Open index.html in browser

---

## 🔄 How It Works

1. Enter city, soil type, and land size
2. System fetches weather data
3. Matches conditions with crop database
4. Displays best crop recommendations

---

## 🧠 Recommendation Logic

- Temperature match → +3
- Soil match → +3
- Rainfall match → +2

Minimum score required: 4

---

## 📊 Output

- Crop name
- Fertilizer
- Quantity
- Temperature suitability
- Drought risk
- AI explanation

---

## ⚠️ Limitations

- Rule-based (not full ML model)
- Limited crop data
- Depends on external API

---

## 🔮 Future Improvements

- Machine Learning model
- Mobile app
- GPS integration
- Market prediction
- Soil testing integration

---

## 👨‍💻 Author

Smart Agriculture Project

---

## 📜 License

Free for educational use
