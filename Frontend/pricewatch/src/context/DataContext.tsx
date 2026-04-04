import { createContext, useContext, useEffect, useState } from "react";

type DataContextType = {
  data: any;
  loading: boolean;
  reload: () => void;
  triggerAlert: () => Promise<void>;
  resetDemo: () => Promise<void>;

  unreadAlerts: number;
  setUnreadAlerts: (n: number) => void;
};

const DataContext = createContext<DataContextType>({
  data: null,
  loading: true,
  reload: () => {},
  triggerAlert: async () => {},
  resetDemo: async () => {},

  unreadAlerts: 0,
  setUnreadAlerts: () => {},
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {

  const [data, setData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  // 🔴 notification badge count
  const [unreadAlerts, setUnreadAlerts] = useState(0);


  const fetchData = () => {

    setLoading(true);

    fetch("/data.json")

      .then((res) => {

        if (!res.ok) {

          throw new Error("Failed to fetch data.json");

        }

        return res.json();

      })

      .then((json) => {

        setData(json);

        setLoading(false);

      })

      .catch((err) => {

        console.error("FETCH ERROR:", err);

        // fallback demo data
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

            {

              asin: "demo2",

              name: "SKF 6305 Bearing",

              your_price: 300,

              buy_box_winner: "Competitor",

              status: "LOSE",

              prices: [

                { seller: "You", price: 300 },

                { seller: "Competitor A", price: 290 },

              ],

              insight: "Competitor cheaper",

              recommended_price: 289,

              confidence: 70,

              win_probability: 55,

              strategy: "Reduce price",

              impact: "Risk of losing Buy Box",

            },

          ],

        };

        setData(fallbackData);

        setLoading(false);

      });

  };


  // load data on start
  useEffect(() => {

    fetchData();

  }, []);


  // calculate unread alerts dynamically
  useEffect(() => {

    if (data?.products) {

      const loseCount =

        data.products.filter(

          (p: any) => p.status === "LOSE"

        ).length;

      setUnreadAlerts(loseCount);

    }

  }, [data]);


  const triggerAlert = async () => {

    await new Promise((resolve) => setTimeout(resolve, 1000));

  };


  const resetDemo = async () => {

    fetchData();

    await new Promise((resolve) => setTimeout(resolve, 500));

  };


  return (

    <DataContext.Provider

      value={{

        data,

        loading,

        reload: fetchData,

        triggerAlert,

        resetDemo,

        unreadAlerts,

        setUnreadAlerts,

      }}

    >

      {children}

    </DataContext.Provider>

  );

};


export const useData = () => useContext(DataContext);