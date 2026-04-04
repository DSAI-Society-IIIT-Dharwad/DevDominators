import { createContext, useContext, useEffect, useState } from "react";

type DataContextType = {
  data: any;
  loading: boolean;
  reload: () => void;
  triggerAlert: () => Promise<void>;
  resetDemo: () => Promise<void>;
};

const DataContext = createContext<DataContextType>({
  data: null,
  loading: true,
  reload: () => {},
  triggerAlert: async () => {},
  resetDemo: async () => {},
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);

    fetch("/data.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data.json");
        }
        console.log("Response OK:", res);
        return res.json();
      })
      .then((json) => {
        console.log("DATA LOADED:", json);
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("FETCH ERROR:", err);

        // ✅ FALLBACK DATA (VERY IMPORTANT FOR DEMO)
        const fallbackData = {
          summary: {
            total_asins: 4,
            active_alerts: 2,
            buy_box_win_rate: 50,
            avg_market_price: 276,
          },
          products: [
            {
              asin: "demo1",
              name: "SKF 6205 Bearing",
              your_price: 287,
              buy_box_winner: "You",
              status: "WIN",
              prices: [
                { seller: "You", price: 287 },
                { seller: "Competitor A", price: 292 },
              ],
              insight: "You are competitive",
              recommended_price: 285,
              confidence: 85,
              win_probability: 90,
              strategy: "Maintain pricing",
              impact: "High visibility",
            },
          ],
        };

        console.log("USING FALLBACK DATA");
        setData(fallbackData);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerAlert = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const resetDemo = async () => {
    fetchData();
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <DataContext.Provider
      value={{ data, loading, reload: fetchData, triggerAlert, resetDemo }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);