export interface SellerPrice {
  seller: string;
  price: number;
}

export interface Product {
  asin: string;
  name: string;
  brand: string;
  your_price: number;
  buy_box_winner: string;
  status: "WIN" | "LOSE";
  prices: SellerPrice[];
  alerts: string[];
  insight: string;
  recommended_price: number;
  confidence: number;
  win_probability: number;
  price_gap: number;
  market_position: string;
  reason: string;
  strategy: string;
  impact: string;
}

export interface Summary {
  total_asins: number;
  active_alerts: number;
  buy_box_win_rate: number;
  avg_market_price: number;
  products_winning: number;
  products_losing: number;
}

export interface PriceData {
  last_updated: string;
  summary: Summary;
  products: Product[];
}
