from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
from datetime import datetime
import os


def scrape_amazon():

    # ------------------ SETUP ------------------
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    print("Opening Amazon...")

    driver.get("https://www.amazon.in/s?k=skf+bearing")
    time.sleep(5)

    products = driver.find_elements(
        By.CSS_SELECTOR,
        "div[data-component-type='s-search-result']"
    )

    data = []

    # ------------------ SCRAPE ------------------
    for product in products[:6]:
        try:
            title = product.find_element(By.TAG_NAME, "h2").text
            if len(title) < 10:
                continue
        except Exception:
            continue

        try:
            price_element = product.find_element(
                By.CLASS_NAME,
                "a-price-whole"
            )
            price = int(price_element.text.replace(",", ""))
        except Exception:
            continue

        data.append({
            "title": title,
            "price": price
        })

    print("\n--- SCRAPED DATA ---")
    for item in data:
        print(item)

    # ------------------ JSON STRUCTURE ------------------
    output = {
        "last_updated": str(datetime.now()),
        "summary": {},
        "products": []
    }

    win_count = 0

    # ------------------ PROCESS EACH PRODUCT ------------------
    for i, item in enumerate(data):

        your_price = item["price"]

        # 🔥 SIMULATED COMPETITION
        if i % 2 == 0:
            seller_prices = [
                your_price,
                your_price + 10,
                your_price + 20,
                your_price + 5
            ]
        else:
            seller_prices = [
                your_price,
                your_price - 15,
                your_price + 10,
                your_price - 5
            ]

        sellers = [
            {"seller": "You", "price": seller_prices[0]},
            {"seller": "Seller1", "price": seller_prices[1]},
            {"seller": "Seller2", "price": seller_prices[2]},
            {"seller": "Seller3", "price": seller_prices[3]}
        ]

        # ------------------ PRICE ANALYSIS ------------------
        competitor_price = min(
            p["price"] for p in sellers if p["seller"] != "You"
        )
        price_gap = your_price - competitor_price

        # ------------------ STATUS ------------------
        if your_price <= competitor_price:
            status = "WIN"
            buy_box_winner = "You"
            win_count += 1
        else:
            status = "LOSE"
            buy_box_winner = "Competitor"

        # ------------------ ALERT SYSTEM ------------------
        alerts = []

        if status == "LOSE":
            alerts.append(f"⚠️ Undercut by ₹{abs(price_gap)}")

        if abs(price_gap) <= 5:
            alerts.append("⚠️ Very close competition")

        if len(sellers) >= 4:
            alerts.append("🔥 High competition")

        if your_price < competitor_price - 20:
            alerts.append("💸 Price too low (profit risk)")

        # ------------------ RECOMMENDATION ------------------
        recommended_price = (
            your_price - 2 if status == "WIN"
            else competitor_price - 1
        )

        # ------------------ WIN PROBABILITY ------------------
        if status == "WIN":
            win_probability = 85
        elif abs(price_gap) < 20:
            win_probability = 60
        else:
            win_probability = 30

        # ------------------ INSIGHT ------------------
        if status == "WIN":
            insight = f"You are ₹{abs(price_gap)} cheaper than competitors."
        else:
            insight = f"Competitor is cheaper by ₹{abs(price_gap)}."

        # ------------------ MARKET POSITION ------------------
        if status == "WIN":
            market_position = "Competitive"
        elif abs(price_gap) < 20:
            market_position = "Close Competition"
        else:
            market_position = "Expensive"

        # ------------------ PRODUCT OBJECT ------------------
        product_obj = {
            "asin": f"demo{i}",
            "name": item["title"],
            "brand": "SKF",
            "your_price": your_price,
            "buy_box_winner": buy_box_winner,
            "status": status,
            "prices": sellers,
            "alerts": alerts,
            "insight": insight,
            "recommended_price": recommended_price,
            "confidence": 85,
            "win_probability": win_probability,
            "price_gap": price_gap,
            "market_position": market_position,
            "reason": "Lowest price wins Buy Box",
            "strategy": (
                "Maintain price" if status == "WIN"
                else "Reduce price"
            ),
            "impact": (
                "Higher visibility & conversions"
                if status == "WIN"
                else "Loss of sales"
            )
        }

        output["products"].append(product_obj)

    # ------------------ SUMMARY ------------------
    total = len(output["products"])

    output["summary"] = {
        "total_asins": total,
        "active_alerts": sum(
            len(p["alerts"]) for p in output["products"]
        ),
        "buy_box_win_rate": (
            int((win_count / total) * 100) if total > 0 else 0
        ),
        "avg_market_price": (
            sum(p["your_price"] for p in output["products"]) // total
            if total > 0 else 0
        )
    }

    # ------------------ SAVE FILE ------------------
    base_path = os.path.dirname(os.path.dirname(__file__))
    data_folder = os.path.join(base_path, "data")
    os.makedirs(data_folder, exist_ok=True)

    file_path = os.path.join(data_folder, "output.json")

    with open(file_path, "w") as f:
        json.dump(output, f, indent=2)

    print("\n✅ JSON updated successfully!")

    driver.quit()

    return output


# ------------------ RUN ------------------
if __name__ == "__main__":
    scrape_amazon()