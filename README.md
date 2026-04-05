# 🚀 PriceWatch Pro - Amazon Price Intelligence System

## 📌 Overview

PriceWatch Pro is a smart pricing intelligence dashboard designed to help Amazon sellers monitor competition, analyze pricing trends, and optimize their chances of winning the Buy Box.

This system combines **web scraping, data simulation, and analytics** to provide actionable insights for better pricing decisions.

---

## 🎯 Problem Statement

In e-commerce platforms like Amazon:

* Multiple sellers compete for the same product
* Prices change dynamically
* Sellers lack visibility into competitor pricing
* Losing the Buy Box leads to reduced sales

---

## 💡 Our Solution

We built a **Price Intelligence System** that:

* Tracks product prices
* Simulates multi-seller competition
* Identifies Buy Box winners
* Generates pricing recommendations
* Provides real-time alerts

---

## 🏗️ Architecture

Scraper (Selenium) → Data Processing → JSON → Frontend Dashboard

---

## ⚙️ Tech Stack

### 🔹 Backend / Scraper

* Python
* Selenium
* WebDriver Manager

### 🔹 Frontend

* React (Vite)
* TypeScript
* Tailwind CSS

### 🔹 Data Handling

* JSON-based data flow

---

## 🔄 Workflow

### 1. Data Collection

* Scrapes product data from Amazon (title + price)

### 2. Data Simulation

* Generates multiple sellers per product
* Simulates real-world pricing competition

### 3. Buy Box Logic

* Lowest price wins the Buy Box
* Others marked as losing sellers

### 4. Intelligence Engine

Calculates:

* Price gap
* Market position
* Win probability
* Recommended price
* Alerts & insights

### 5. Frontend Visualization

Displays:

* Dashboard metrics
* Product comparison
* Alerts
* AI recommendations

---

## 📊 Features

### 📌 Dashboard

* Total Products
* Buy Box Win Rate
* Active Alerts
* Average Market Price

---

### 📈 Live Pricing

* Compare your price with competitors
* Visualize pricing gaps

---

### 🚨 Alerts System

* Detects price competition
* Shows WIN / LOSE status
* Popup alert simulation

---

### 🤖 AI Recommender

* Suggests optimal pricing
* Provides strategy to regain Buy Box

---

## 🧠 Key Innovation

> We simulate real-world Buy Box competition by modeling multiple sellers per product and generating actionable pricing intelligence.

---

## ⚠️ Limitations

* Uses simulated competitor pricing
* Does not fetch real seller-level data due to platform restrictions

---

## 🚀 Future Enhancements

* Real-time API integration
* Historical price tracking
* Machine Learning-based price prediction
* Seller performance analytics

---

## ▶️ How to Run

### 1. Clone Repository

git clone https://github.com/DSAI-Society-IIIT-Dharwad/DevDominators.git
cd DevDominators

---

### 2. Run Scraper

python Scraper/scraper.py

---

### 3. Update Frontend Data

Copy:
data/output.json

Paste into:
Frontend/pricewatch/public/data.json

---

### 4. Run Frontend

cd Frontend/pricewatch
npm install
npm run dev

---

## 🎥 Demo

Shows:

* Pricing dashboard
* Buy Box competition
* Alerts & recommendations

---

## 👥 Team

DevDominators

---

## 🏁 Conclusion

PriceWatch Pro helps sellers make **data-driven pricing decisions**, improve competitiveness, and maximize their chances of winning the Buy Box.

---

⭐ If you like this project, give it a star!
