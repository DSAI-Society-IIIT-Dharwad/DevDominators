import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { PriceData } from '@/types/data';

interface DataContextType {
  data: PriceData | null;
  originalData: PriceData | null;
  setData: React.Dispatch<React.SetStateAction<PriceData | null>>;
  loading: boolean;
  reload: () => void;
  resetDemo: () => void;
}

const DataContext = createContext<DataContextType>({
  data: null,
  originalData: null,
  setData: () => {},
  loading: true,
  reload: () => {},
  resetDemo: () => {},
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const originalRef = useRef<PriceData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/data.json');
      const json: PriceData = await res.json();
      if (!originalRef.current) {
        originalRef.current = JSON.parse(JSON.stringify(json));
      }
      setData(json);
    } catch (e) {
      console.error('Failed to load data.json', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetDemo = useCallback(() => {
    if (originalRef.current) {
      setData(JSON.parse(JSON.stringify(originalRef.current)));
    }
  }, []);

  return (
    <DataContext.Provider value={{ data, originalData: originalRef.current, setData, loading, reload: fetchData, resetDemo }}>
      {children}
    </DataContext.Provider>
  );
};
