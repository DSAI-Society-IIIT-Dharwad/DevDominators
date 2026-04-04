# backend/app.py
# PASTE THIS ENTIRE FILE

import sys
import io
sys.stdout = io.TextIOWrapper(
    sys.stdout.buffer,
    encoding='utf-8',
    errors='replace'
)

from flask import Flask, jsonify
from flask_cors import CORS
import json
import os
import threading
import subprocess
import schedule
import time
from datetime import datetime
import copy

app = Flask(__name__)
CORS(app)

# ── FILE PATHS ────────────────────────────────────────────
# backend/app.py is inside Amazon_Price_Intelligence/backend/
# So BASE_PATH goes one level up to Amazon_Price_Intelligence/
BASE_PATH = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

# Where scraper saves output
SCRAPER_OUTPUT = os.path.join(BASE_PATH, "data", "output.json")

# Where frontend reads from (public folder)
FRONTEND_DATA = os.path.join(
    BASE_PATH,
    "Frontend", "pricewatch", "public", "data.json"
)

print(f"[INFO] Scraper output : {SCRAPER_OUTPUT}")
print(f"[INFO] Frontend data  : {FRONTEND_DATA}")

# ── BACKUP for demo reset ─────────────────────────────────
_original_data = None

# ── HELPERS ───────────────────────────────────────────────

def load_data():
    """Load from scraper output file"""
    try:
        with open(SCRAPER_OUTPUT, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[ERROR] File not found: {SCRAPER_OUTPUT}")
        return {
            "error": "output.json not found. Run scraper first.",
            "last_updated": str(datetime.now()),
            "summary": {
                "total_asins": 0,
                "active_alerts": 0,
                "buy_box_win_rate": 0,
                "avg_market_price": 0,
                "products_winning": 0,
                "products_losing": 0
            },
            "products": []
        }
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON parse error: {e}")
        return {"error": "output.json is corrupted"}


def save_data(data):
    """Save to BOTH locations so frontend sees update"""
    # Save to scraper output
    os.makedirs(os.path.dirname(SCRAPER_OUTPUT), exist_ok=True)
    with open(SCRAPER_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Also copy to frontend public folder
    sync_to_frontend(data)


def sync_to_frontend(data=None):
    """
    Copy output.json to Frontend/pricewatch/public/data.json
    so the React app can read it directly
    """
    if data is None:
        data = load_data()

    os.makedirs(os.path.dirname(FRONTEND_DATA), exist_ok=True)
    with open(FRONTEND_DATA, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[SYNC] Copied to frontend: {FRONTEND_DATA}")


# ── API ROUTES ────────────────────────────────────────────

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    """Full data — used by all pages"""
    data = load_data()
    sync_to_frontend(data)
    return jsonify(data)


@app.route("/api/summary", methods=["GET"])
def get_summary():
    """KPI cards only"""
    data = load_data()
    return jsonify(data.get("summary", {}))


@app.route("/api/products", methods=["GET"])
def get_products():
    """All products list"""
    data = load_data()
    return jsonify(data.get("products", []))


@app.route("/api/product/<asin>", methods=["GET"])
def get_product(asin):
    """Single product by asin"""
    data = load_data()
    for p in data.get("products", []):
        if p["asin"] == asin:
            return jsonify(p)
    return jsonify({"error": "Not found"}), 404


@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    """Flattened alerts from all products"""
    data = load_data()
    alerts = []

    for product in data.get("products", []):
        comp_prices = [
            p["price"] for p in product["prices"]
            if p["seller"] != "You"
        ]
        min_competitor = min(comp_prices) if comp_prices else 0

        for alert_msg in product.get("alerts", []):
            # Determine severity from prefix
            if alert_msg.startswith("[ALERT]") or \
               alert_msg.startswith("[WARNING]"):
                severity = "high"
            elif alert_msg.startswith("[WATCH]"):
                severity = "medium"
            elif alert_msg.startswith("[WIN]"):
                severity = "success"
            else:
                severity = "info"

            alerts.append({
                "product_name":      product["name"],
                "asin":              product["asin"],
                "brand":             product["brand"],
                "message":           alert_msg,
                "severity":          severity,
                "status":            product["status"],
                "your_price":        product["your_price"],
                "competitor_price":  min_competitor,
                "recommended_price": product["recommended_price"],
                "win_probability":   product["win_probability"],
                "strategy":          product["strategy"],
                "timestamp":         data.get("last_updated", "")
            })

    return jsonify(alerts)


@app.route("/api/scraper/run", methods=["POST"])
def run_scraper():
    """Trigger scraper manually"""
    scraper_path = os.path.join(
        BASE_PATH, "Scraper", "scraper.py"
    )

    def run_in_background():
        print(f"[{datetime.now()}] Scraper started...")
        subprocess.run(
            ["python", scraper_path],
            capture_output=False
        )
        # After scraper finishes, sync to frontend
        sync_to_frontend()
        print(f"[{datetime.now()}] Scraper done + synced.")

    thread = threading.Thread(
        target=run_in_background,
        daemon=True
    )
    thread.start()

    return jsonify({
        "status":  "started",
        "message": "Scraper running. Refresh in 30 seconds."
    })


@app.route("/api/scraper/status", methods=["GET"])
def scraper_status():
    """Check last updated time"""
    data = load_data()
    return jsonify({
        "last_updated":   data.get("last_updated", "Never"),
        "total_products": len(data.get("products", [])),
        "file_exists":    os.path.exists(SCRAPER_OUTPUT)
    })


# ── DEMO ROUTES ───────────────────────────────────────────

@app.route("/api/demo/trigger", methods=["POST"])
def trigger_demo():
    """
    Simulate competitor dropping price below yours.
    Flips first WIN product to LOSE status.
    Use during presentation for live demo effect.
    """
    global _original_data
    data = load_data()

    # Backup original data before modifying
    if _original_data is None:
        _original_data = copy.deepcopy(data)

    if not data.get("products"):
        return jsonify({"error": "No products found"}), 400

    # Find first WIN product to flip
    target = None
    for p in data["products"]:
        if p["status"] == "WIN":
            target = p
            break

    if not target:
        return jsonify({
            "error": "No WIN products to demonstrate"
        }), 400

    your_price   = target["your_price"]
    drop_amount  = 20
    new_comp_price = your_price - drop_amount

    # Modify the product to show LOSE state
    target["prices"][1]["price"] = new_comp_price
    target["status"]             = "LOSE"
    target["buy_box_winner"]     = "Seller1"
    target["price_gap"]          = drop_amount
    target["win_probability"]    = 35
    target["market_position"]    = "Expensive"
    target["strategy"]           = "Reduce price immediately"
    target["impact"]             = "Loss of sales — urgent action needed"
    target["insight"]            = (
        f"Seller1 just dropped to Rs.{new_comp_price}! "
        f"You are now Rs.{drop_amount} more expensive. "
        f"Drop to Rs.{new_comp_price - 1} to reclaim Buy Box."
    )
    target["recommended_price"]  = new_comp_price - 1
    target["alerts"] = [
        f"[ALERT] Competitor dropped to Rs.{new_comp_price}!"
        f" You lost Buy Box!",
        f"[WARNING] Undercut by Rs.{drop_amount}"
        f" - Immediate action required",
        "[INFO] High competition - 3 sellers active"
    ]

    # Recalculate summary
    win_count = sum(
        1 for p in data["products"]
        if p["status"] == "WIN"
    )
    total = len(data["products"])
    total_alerts = sum(
        len(p["alerts"]) for p in data["products"]
    )

    data["summary"]["buy_box_win_rate"] = int(
        (win_count / total) * 100
    ) if total > 0 else 0
    data["summary"]["active_alerts"]    = total_alerts
    data["summary"]["products_winning"] = win_count
    data["summary"]["products_losing"]  = total - win_count
    data["last_updated"]                = str(datetime.now())

    # Save and sync to frontend
    save_data(data)

    return jsonify({
        "status":           "triggered",
        "message":          f"Competitor dropped price by Rs.{drop_amount}!",
        "affected_product": target["name"][:50],
        "new_data":         data  # send back full data
    })


@app.route("/api/demo/reset", methods=["POST"])
def reset_demo():
    """Restore original data"""
    global _original_data

    if _original_data is not None:
        save_data(_original_data)
        _original_data = None
        return jsonify({
            "status":  "reset",
            "message": "Data restored to original."
        })

    # No backup — re-run scraper
    scraper_path = os.path.join(
        BASE_PATH, "Scraper", "scraper.py"
    )
    subprocess.run(["python", scraper_path])
    sync_to_frontend()

    return jsonify({
        "status":  "reset",
        "message": "Scraper re-run. Data refreshed."
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status":           "ok",
        "scraper_output":   SCRAPER_OUTPUT,
        "frontend_data":    FRONTEND_DATA,
        "data_exists":      os.path.exists(SCRAPER_OUTPUT),
        "timestamp":        datetime.now().isoformat()
    })


# ── AUTO SCHEDULER ────────────────────────────────────────

def scheduled_scrape():
    scraper_path = os.path.join(
        BASE_PATH, "Scraper", "scraper.py"
    )
    print(f"[{datetime.now()}] Scheduled scrape starting...")
    subprocess.run(["python", scraper_path])
    sync_to_frontend()
    print(f"[{datetime.now()}] Scheduled scrape complete.")


def run_scheduler():
    schedule.every(30).minutes.do(scheduled_scrape)
    while True:
        schedule.run_pending()
        time.sleep(60)


# Start scheduler in background
threading.Thread(
    target=run_scheduler,
    daemon=True
).start()


# ── START ─────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  PriceWatch Pro — Backend API")
    print("=" * 55)
    print(f"  Scraper output : {SCRAPER_OUTPUT}")
    print(f"  Frontend data  : {FRONTEND_DATA}")
    print(f"  Data exists    : {os.path.exists(SCRAPER_OUTPUT)}")
    print("=" * 55)

    # Sync existing data to frontend on startup
    if os.path.exists(SCRAPER_OUTPUT):
        sync_to_frontend()
        print("  Synced existing data to frontend on startup.")

    print("  API running at : http://localhost:5000")
    print("=" * 55)

    app.run(debug=True, port=5000, use_reloader=False)