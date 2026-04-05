import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { PriceData } from "@/types/data";

type DataContextType = {
  data: PriceData | null;
  loading: boolean;
  reload: () => void;
  triggerAlert: () => Promise<void>;
  resetDemo: () => Promise<void>;
  readAlerts: string[];
  setReadAlerts: React.Dispatch<React.SetStateAction<string[]>>;
};

const DataContext = createContext<DataContextType>({
  data: null,
  loading: true,
  reload: () => {},
  triggerAlert: async () => {},
  resetDemo: async () => {},
  readAlerts: [],
  setReadAlerts: () => {},
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [readAlerts, setReadAlerts] = useState<string[]>([]);
  const originalRef = useRef<PriceData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/data.json");
      if (!res.ok) {
        throw new Error("Failed to fetch data.json");
      }
      const json: PriceData = await res.json();
      if (!originalRef.current) {
        originalRef.current = JSON.parse(JSON.stringify(json));
      }
      setData(json);
    } catch (err) {
      console.error("Failed to load data.json", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerAlert = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const resetDemo = async () => {
    if (originalRef.current) {
      setData(JSON.parse(JSON.stringify(originalRef.current)));
      setReadAlerts([]);
    }
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
        readAlerts,
        setReadAlerts,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
