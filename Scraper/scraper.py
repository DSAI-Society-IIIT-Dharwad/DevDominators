from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
from datetime import datetime
from pathlib import Path
options = webdriver.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

driver.get("https://www.amazon.in/s?k=skf+bearing")

time.sleep(5)

# 🔽 FIND PRODUCTS
products = driver.find_elements(By.CSS_SELECTOR, "div[data-component-type='s-search-result']")

data = []

# 🔽 LOOP THROUGH PRODUCTS
for product in products[:5]:  # take first 5
    try:
        title = product.find_element(By.TAG_NAME, "h2").text
    except:
        title = "No title"

    try:
        price = product.find_element(By.CLASS_NAME, "a-price-whole").text
        price = int(price.replace(",", ""))
    except:
        price = 9999

    data.append({
        "title": title,
        "price": price
    })

# 🔽 PRINT DATA
print("\n--- SCRAPED DATA ---")
for item in data:
    print(item)

output = {
    "last_updated": str(datetime.now()),
    "summary": {},
    "products": []
}

for item in data:
    product = {
        "asin": "demo123",
        "name": item["title"],
        "brand": "SKF",
        "your_price": item["price"],
        "buy_box_winner": "Competitor",
        "status": "LOST",

        "prices": [
            {"seller": "You", "price": item["price"]},
            {"seller": "Competitor", "price": item["price"] - 20},
            {"seller": "Other", "price": item["price"] + 30}
        ],

        "history": [
            {"time": "10:00", "price": item["price"] + 20},
            {"time": "10:10", "price": item["price"]}
        ],

        "alerts": ["Price competition detected"],
        "insight": "Undercutting detected",

        "recommended_price": item["price"] - 5,
        "confidence": 80,
        "win_probability": 75
    }

    output["products"].append(product)

# 🔽 ADD SUMMARY
output["summary"] = {
    "total_asins": len(output["products"]),
    "active_alerts": 1,
    "buy_box_win_rate": 50,
    "avg_market_price": sum([p["your_price"] for p in output["products"]]) // len(output["products"])
}

# 🔽 SAVE FILE
output_path = Path(__file__).resolve().parent.parent / "data" / "output.json"
output_path.parent.mkdir(parents=True, exist_ok=True)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2)

print(f"\n✅ JSON file created at {output_path}")
driver.quit()