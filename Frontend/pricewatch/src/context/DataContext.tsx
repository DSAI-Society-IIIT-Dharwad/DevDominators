// src/context/DataContext.tsx
// REPLACE ENTIRE FILE WITH THIS

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from "react";

// ── TYPES ─────────────────────────────────────────────────
export interface SellerPrice {
  seller: string;
  price:  number;
}

export interface Product {
  asin:              string;
  name:              string;
  brand:             string;
  your_price:        number;
  buy_box_winner:    string;
  status:            "WIN" | "LOSE";
  prices:            SellerPrice[];
  alerts:            string[];
  insight:           string;
  recommended_price: number;
  confidence:        number;
  win_probability:   number;
  price_gap:         number;
  market_position:   string;
  reason:            string;
  strategy:          string;
  impact:            string;
}

export interface Summary {
  total_asins:       number;
  active_alerts:     number;
  buy_box_win_rate:  number;
  avg_market_price:  number;
  products_winning:  number;
  products_losing:   number;
}

export interface DashboardData {
  last_updated: string;
  summary:      Summary;
  products:     Product[];
}

interface DataContextType {
  data:          DashboardData | null;
  loading:       boolean;
  error:         string | null;
  lastSync:      string;
  refresh:       () => void;
  triggerAlert:  () => void;
  resetDemo:     () => void;
}

// ── DEFAULT DATA (fallback if API not running) ────────────
const DEFAULT_DATA: DashboardData = {
  last_updated: "2026-04-04 17:24:39",
  summary: {
    total_asins:      4,
    active_alerts:    12,
    buy_box_win_rate: 50,
    avg_market_price: 276,
    products_winning: 2,
    products_losing:  2
  },
  products: [
    {
      asin:              "demo0",
      name:              "6302 Deep Groove Ball Bearing 15x42x13mm Open Type",
      brand:             "SKF",
      your_price:        287,
      buy_box_winner:    "You",
      status:            "WIN",
      prices: [
        { seller: "You",     price: 287 },
        { seller: "Seller1", price: 297 },
        { seller: "Seller2", price: 307 },
        { seller: "Seller3", price: 292 }
      ],
      alerts: [
        "[WIN] Winning Buy Box - Maintain position",
        "[WATCH] Seller3 only Rs.5 behind - monitor closely",
        "[INFO] High competition - 3 sellers active"
      ],
      insight:           "You are Rs.5 cheaper than nearest competitor.",
      recommended_price: 285,
      confidence:        85,
      win_probability:   85,
      price_gap:         -5,
      market_position:   "Competitive",
      reason:            "Lowest price wins Buy Box",
      strategy:          "Maintain current price",
      impact:            "Higher visibility and conversions"
    },
    {
      asin:              "demo1",
      name:              "Ball Bearing 6206-2RS1 Rubber Shield Deep Groove 30x62x16",
      brand:             "SKF",
      your_price:        294,
      buy_box_winner:    "Seller1",
      status:            "LOSE",
      prices: [
        { seller: "You",     price: 294 },
        { seller: "Seller1", price: 279 },
        { seller: "Seller2", price: 304 },
        { seller: "Seller3", price: 289 }
      ],
      alerts: [
        "[ALERT] Lost Buy Box! Seller1 at Rs.279 (Rs.15 cheaper)",
        "[WARNING] Undercut by Rs.15 - Immediate action required",
        "[INFO] High competition - 3 sellers active"
      ],
      insight:           "Seller1 undercutting by Rs.15. Drop to Rs.278.",
      recommended_price: 278,
      confidence:        85,
      win_probability:   65,
      price_gap:         15,
      market_position:   "Close Competition",
      reason:            "Lowest price wins Buy Box",
      strategy:          "Reduce price to Rs.278",
      impact:            "Regain Buy Box and recover lost sales"
    },
    {
      asin:              "demo2",
      name:              "Pillow Block Ball Bearing UCP205 25mm Bore",
      brand:             "SKF",
      your_price:        245,
      buy_box_winner:    "You",
      status:            "WIN",
      prices: [
        { seller: "You",     price: 245 },
        { seller: "Seller1", price: 255 },
        { seller: "Seller2", price: 265 },
        { seller: "Seller3", price: 250 }
      ],
      alerts: [
        "[WIN] Winning Buy Box - Maintain position",
        "[WATCH] Seller3 only Rs.5 behind - monitor closely",
        "[INFO] High competition - 3 sellers active"
      ],
      insight:           "You are Rs.5 cheaper than nearest competitor.",
      recommended_price: 243,
      confidence:        85,
      win_probability:   85,
      price_gap:         -5,
      market_position:   "Competitive",
      reason:            "Lowest price wins Buy Box",
      strategy:          "Maintain current price",
      impact:            "Higher visibility and conversions"
    },
    {
      asin:              "demo3",
      name:              "Ball Bearing 6305 Non Shield Deep Groove 25x62x17mm",
      brand:             "SKF",
      your_price:        368,
      buy_box_winner:    "Seller1",
      status:            "LOSE",
      prices: [
        { seller: "You",     price: 368 },
        { seller: "Seller1", price: 353 },
        { seller: "Seller2", price: 378 },
        { seller: "Seller3", price: 363 }
      ],
      alerts: [
        "[ALERT] Lost Buy Box! Seller1 at Rs.353 (Rs.15 cheaper)",
        "[WARNING] Undercut by Rs.15 - Immediate action required",
        "[INFO] High competition - 3 sellers active"
      ],
      insight:           "Seller1 undercutting by Rs.15. Drop to Rs.352.",
      recommended_price: 352,
      confidence:        85,
      win_probability:   65,
      price_gap:         15,
      market_position:   "Close Competition",
      reason:            "Lowest price wins Buy Box",
      strategy:          "Reduce price to Rs.352",
      impact:            "Regain Buy Box and recover lost sales"
    }
  ]
};

// ── CONTEXT ───────────────────────────────────────────────
const DataContext = createContext<DataContextType>({
  data:         null,
  loading:      true,
  error:        null,
  lastSync:     "",
  refresh:      () => {},
  triggerAlert: () => {},
  resetDemo:    () => {}
});

const API = "http://localhost:5000/api";

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastSync, setLastSync] = useState("");

  const fetchData = useCallback(async () => {
    try {
      // Try Flask API first
      const res = await fetch(`${API}/dashboard`, {
        signal: AbortSignal.timeout(3000)
      });
      const json = await res.json();
      setData(json);
      setError(null);
      console.log("[DATA] Loaded from Flask API");
    } catch {
      // Fallback: try public/data.json
      try {
        const res = await fetch("/data.json");
        const json = await res.json();
        setData(json);
        setError(null);
        console.log("[DATA] Loaded from public/data.json");
      } catch {
        // Final fallback: use hardcoded default
        setData(DEFAULT_DATA);
        setError("Using demo data. Start Flask backend for live data.");
        console.log("[DATA] Using hardcoded default data");
      }
    } finally {
      setLoading(false);
      setLastSync(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── DEMO: Trigger competitor alert ───────────────────────
  const triggerAlert = useCallback(async () => {
    try {
      // Try API first
      const res = await fetch(`${API}/demo/trigger`, {
        method: "POST",
        signal: AbortSignal.timeout(3000)
      });
      const result = await res.json();
      if (result.new_data) {
        setData(result.new_data);
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch {
      // Fallback: modify state directly without API
      setData(prev => {
        if (!prev) return prev;
        const updated = JSON.parse(JSON.stringify(prev));

        const target = updated.products.find(
          (p: Product) => p.status === "WIN"
        );
        if (!target) return prev;

        const dropAmount    = 20;
        const newCompPrice  = target.your_price - dropAmount;

        target.prices[1].price   = newCompPrice;
        target.status            = "LOSE";
        target.buy_box_winner    = "Seller1";
        target.price_gap         = dropAmount;
        target.win_probability   = 35;
        target.market_position   = "Expensive";
        target.strategy          = "Reduce price immediately";
        target.impact            = "Loss of sales - urgent action";
        target.insight           = `Seller1 dropped to Rs.${newCompPrice}! Drop to Rs.${newCompPrice - 1}.`;
        target.recommended_price = newCompPrice - 1;
        target.alerts = [
          `[ALERT] Competitor dropped to Rs.${newCompPrice}! Lost Buy Box!`,
          `[WARNING] Undercut by Rs.${dropAmount} - Act now`,
          "[INFO] High competition - 3 sellers active"
        ];

        const wins = updated.products.filter(
          (p: Product) => p.status === "WIN"
        ).length;
        const total = updated.products.length;

        updated.summary.buy_box_win_rate  = Math.round((wins/total)*100);
        updated.summary.active_alerts     = updated.products.reduce(
          (sum: number, p: Product) => sum + p.alerts.length, 0
        );
        updated.summary.products_winning  = wins;
        updated.summary.products_losing   = total - wins;
        updated.last_updated              = new Date().toLocaleString();

        return updated;
      });
    }
  }, []);

  // ── DEMO: Reset to original ───────────────────────────────
  const resetDemo = useCallback(async () => {
    try {
      await fetch(`${API}/demo/reset`, {
        method: "POST",
        signal: AbortSignal.timeout(3000)
      });
    } catch {
      // ignore API error, just reload
    }
    // Always reload fresh data
    await fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider value={{
      data,
      loading,
      error,
      lastSync,
      refresh:      fetchData,
      triggerAlert,
      resetDemo
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}