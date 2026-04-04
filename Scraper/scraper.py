import sys
import io

# Fix Windows Unicode error
sys.stdout = io.TextIOWrapper(
    sys.stdout.buffer,
    encoding='utf-8',
    errors='replace'
)

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
from datetime import datetime
import os


def scrape_amazon():

    # ── SETUP ──────────────────────────────────────────────
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

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

    # ── SCRAPE ─────────────────────────────────────────────
    for product in products[:6]:
        try:
            title = product.find_element(By.TAG_NAME, "h2").text
            if len(title) < 10:
                continue
        except:
            continue

        try:
            price = product.find_element(
                By.CLASS_NAME, "a-price-whole"
            ).text
            price = int(price.replace(",", ""))
        except:
            continue

        data.append({"title": title, "price": price})

    driver.quit()

    print(f"\n--- SCRAPED {len(data)} PRODUCTS ---")
    for item in data:
        print(f"  Rs.{item['price']} - {item['title'][:50]}")

    # ── BUILD OUTPUT ───────────────────────────────────────
    output = {
        "last_updated": str(datetime.now()),
        "summary": {},
        "products": []
    }

    win_count = 0

    for i, item in enumerate(data):
        your_price = item["price"]

        # ── COMPETITION SIMULATION ─────────────────────────
        if i % 2 == 0:
            # YOU are cheapest - WIN
            competitor_prices = [
                your_price + 10,
                your_price + 20,
                your_price + 5,
            ]
        else:
            # Competitor cheaper - LOSE
            competitor_prices = [
                your_price - 15,
                your_price + 10,
                your_price - 5,
            ]

        sellers = [
            {"seller": "You",     "price": your_price},
            {"seller": "Seller1", "price": competitor_prices[0]},
            {"seller": "Seller2", "price": competitor_prices[1]},
            {"seller": "Seller3", "price": competitor_prices[2]},
        ]

        # ── ANALYSIS ───────────────────────────────────────
        competitor_min = min(
            p["price"] for p in sellers
            if p["seller"] != "You"
        )
        price_gap = your_price - competitor_min

        # ── STATUS ─────────────────────────────────────────
        if your_price <= competitor_min:
            status = "WIN"
            buy_box_winner = "You"
            win_count += 1
        else:
            status = "LOSE"
            buy_box_winner = "Seller1"

        # ── ALERTS ─────────────────────────────────────────
        alerts = []

        if status == "LOSE":
            alerts.append(
                f"[ALERT] Lost Buy Box! Seller1 at "
                f"Rs.{competitor_min} "
                f"(Rs.{abs(price_gap)} cheaper than you)"
            )
            alerts.append(
                f"[WARNING] Undercut by Rs.{abs(price_gap)} "
                f"- Immediate action required"
            )

        if status == "WIN" and abs(price_gap) <= 10:
            alerts.append(
                f"[WATCH] Seller3 only Rs."
                f"{abs(your_price - competitor_prices[2])} "
                f"behind - monitor closely"
            )

        if status == "WIN":
            alerts.append("[WIN] Winning Buy Box - Maintain position")

        alerts.append(
            "[INFO] High competition - 3 sellers active on this ASIN"
        )

        # ── RECOMMENDATION ─────────────────────────────────
        if status == "WIN":
            recommended_price = your_price - 2
            strategy = "Maintain current price"
            impact = "Higher visibility and conversions"
            win_probability = 85
        else:
            recommended_price = competitor_min - 1
            strategy = f"Reduce price to Rs.{competitor_min - 1}"
            impact = "Regain Buy Box and recover lost sales"
            win_probability = 65

        # ── INSIGHT ────────────────────────────────────────
        if status == "WIN":
            insight = (
                f"You are Rs.{abs(price_gap)} cheaper than "
                f"nearest competitor. Strong Buy Box position."
            )
        else:
            insight = (
                f"Seller1 is undercutting you by Rs.{abs(price_gap)}. "
                f"Drop to Rs.{recommended_price} to reclaim Buy Box."
            )

        # ── MARKET POSITION ────────────────────────────────
        if status == "WIN":
            market_position = "Competitive"
        elif abs(price_gap) <= 20:
            market_position = "Close Competition"
        else:
            market_position = "Expensive"

        # ── PRODUCT OBJECT ─────────────────────────────────
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
            "strategy": strategy,
            "impact": impact
        }

        output["products"].append(product_obj)

    # ── SUMMARY ────────────────────────────────────────────
    total = len(output["products"])
    total_alerts = sum(
        len(p["alerts"]) for p in output["products"]
    )

    output["summary"] = {
        "total_asins": total,
        "active_alerts": total_alerts,
        "buy_box_win_rate": (
            int((win_count / total) * 100) if total > 0 else 0
        ),
        "avg_market_price": (
            sum(p["your_price"] for p in output["products"]) // total
            if total > 0 else 0
        ),
        "products_winning": win_count,
        "products_losing": total - win_count,
    }

    # ── SAVE FILE ──────────────────────────────────────────
    base_path = os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
    data_folder = os.path.join(base_path, "data")
    os.makedirs(data_folder, exist_ok=True)
    file_path = os.path.join(data_folder, "output.json")

    # encoding="utf-8" fixes Windows save issue
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # ── PRINT SUMMARY ──────────────────────────────────────
    print("\n" + "="*50)
    print("JSON updated successfully!")
    print(f"  Products : {total}")
    print(f"  Winning  : {win_count}")
    print(f"  Losing   : {total - win_count}")
    print(f"  Alerts   : {total_alerts}")
    print(f"  Win Rate : {output['summary']['buy_box_win_rate']}%")
    print(f"  Saved to : {file_path}")
    print("="*50)

    return output


if __name__ == "__main__":
    scrape_amazon()